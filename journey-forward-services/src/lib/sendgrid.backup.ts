import sgMail from '@sendgrid/mail';
import { render } from '@react-email/render';
import React from 'react';

// --- 必要な型とコンポーネントのインポート ---
import {
    BookingReceivedProps,
    QuotationSentProps,
    AdminBookingConfirmedProps,
    BookingConfirmedProps
} from '../types/email';

// 作成したメールテンプレート (ファイル名注意！)
// Customer用
import AutoConfirmationCustomer from '../emails/AutoConfirmationCustomer';
import QuotationSentCustomer from '../emails/QuotationSentCustomer';
import BookingConfirmedCustomer from '../emails/BookingConfirmedCustomer';
import InvoiceSentCustomer from '../emails/InvoiceSentCustomer';
import PaymentConfirmedCustomer from '../emails/PaymentConfirmedCustomer';     // 👈 Customer専用
import CancellationNotificationCustomer from '../emails/CancellationNotificationCustomer'; // 👈 Customer専用

// Admin用
import AutoConfirmationAdmin from '../emails/AutoConfirmationAdmin';           // 👈 作ったやつ
import BookingConfirmedAdmin from '../emails/BookingConfirmedAdmin';
import PaymentConfirmedAdmin from '../emails/PaymentConfirmedAdmin';           // 👈 作ったやつ
import CancellationNotificationAdmin from '../emails/CancellationNotificationAdmin'; // 👈 作ったやつ


// 1. 環境変数のチェックと設定
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
} else {
    console.error("SENDGRID_API_KEY is not set in environment variables.");
}

// 2. メール送信を行う汎用関数
export async function sendEmail(
    to: string,
    subject: string,
    htmlContent: string
): Promise<boolean> {
    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) {
        console.error("FROM_EMAIL is not set in environment variables.");
        return false;
    }

    const msg = {
        to,
        from: fromEmail,
        subject,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to: ${to}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        return false;
    }
}

// 3. アドミンのメールアドレスを取得するヘルパー関数
export function getAdminEmail(): string {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        throw new Error("ADMIN_EMAIL is not set in environment variables.");
    }
    return adminEmail;
}


// ****************************
// 4. 各メールの送信ロジック
// ****************************

// --- A. 依頼受付 (フロー開始) ---

/**
 * 依頼受付メール（ユーザー）
 */
export async function sendBookingReceivedCustomerEmail(props: BookingReceivedProps): Promise<boolean> {
    const subject = `【Journey Forward Services】Estimate Request Received (No. ${props.request.requestId})`;
    const htmlContent = await render(React.createElement(AutoConfirmationCustomer, props), { pretty: true });
    return sendEmail(props.customer.email, subject, htmlContent);
}

/**
 * 依頼受付メール（アドミン）
 * ⚠️ AutoConfirmationAdmin を使用するように変更
 */
interface AdminReceivedProps extends BookingReceivedProps {
    dashboardLink: string;
}
export async function sendBookingReceivedAdminEmail(props: AdminReceivedProps): Promise<boolean> {
    const subject = `【New Request】Request #${props.request.requestId} - ${props.customer.lastName}`;
    // ここで Admin用のコンポーネントを使用
    const htmlContent = await render(React.createElement(AutoConfirmationAdmin, props), { pretty: true });
    const adminEmail = getAdminEmail();
    return sendEmail(adminEmail, subject, htmlContent);
}

// --- B. 見積もり送信 ---

/**
 * 見積もりメール送信（ユーザー）
 * ⚠️ Types/email.ts を更新していれば、propsのエラーは消えるはず
 */
export async function sendQuotationSentEmail(props: QuotationSentProps): Promise<boolean> {
    const subject = `【Journey Forward Services】Your Estimate is Ready (No. ${props.request.requestId})`;
    const htmlContent = await render(React.createElement(QuotationSentCustomer, props), { pretty: true });
    return sendEmail(props.customer.email, subject, htmlContent);
}

// --- C. 予約確定 ---

/**
 * 予約確定メール（ユーザー）
 */
export async function sendBookingConfirmedCustomerEmail(props: BookingConfirmedProps): Promise<boolean> {
    const subject = `【Journey Forward Services】Booking Confirmed (No. ${props.request.requestId})`;
    const htmlContent = await render(React.createElement(BookingConfirmedCustomer, props), { pretty: true });
    return sendEmail(props.customer.email, subject, htmlContent);
}

/**
 * 予約確定通知メール（アドミン）
 */
export async function sendBookingConfirmedAdminEmail(props: AdminBookingConfirmedProps): Promise<boolean> {
    const subject = `【Booking Confirmed】Request #${props.request.requestId} - ${props.customer.lastName}`;
    const htmlContent = await render(React.createElement(BookingConfirmedAdmin, props), { pretty: true });
    const adminEmail = getAdminEmail();
    return sendEmail(adminEmail, subject, htmlContent);
}

// --- D. 請求書送信 ---

/**
 * 請求書メール送信（ユーザー）
 */
interface InvoiceSentProps extends QuotationSentProps {
    finalTotal: number;
    paymentLink: string;
}
export async function sendInvoiceSentCustomerEmail(props: InvoiceSentProps): Promise<boolean> {
    const subject = `【Journey Forward Services】Invoice for Request #${props.request.requestId}`;
    const htmlContent = await render(React.createElement(InvoiceSentCustomer, props), { pretty: true });
    return sendEmail(props.customer.email, subject, htmlContent);
}

// --- E. 支払い完了 ---

/**
 * 支払い完了通知（ユーザー・アドミン共通関数だが、内部で分岐）
 */
interface PaymentConfirmedSendProps extends BookingReceivedProps {
    finalTotal: number;
    isCustomer: boolean;
    dashboardLink?: string; // Admin用に追加
}

export async function sendPaymentConfirmedEmail(props: PaymentConfirmedSendProps): Promise<boolean> {
    if (props.isCustomer) {
        // Customerへの送信
        const subject = `【Journey Forward Services】Payment Confirmed (No. ${props.request.requestId})`;
        // isCustomerフラグはコンポーネントから消したので渡さない、または無視される
        const htmlContent = await render(React.createElement(PaymentConfirmedCustomer, {
            customer: props.customer,
            request: props.request,
            requestDate: props.requestDate,
            finalTotal: props.finalTotal
        }), { pretty: true });
        return sendEmail(props.customer.email, subject, htmlContent);

    } else {
        // Adminへの送信
        const subject = `【Payment Received】Request #${props.request.requestId} - ${props.customer.lastName}`;
        const htmlContent = await render(React.createElement(PaymentConfirmedAdmin, {
            customer: props.customer,
            request: props.request,
            requestDate: props.requestDate,
            finalTotal: props.finalTotal,
            dashboardLink: props.dashboardLink || "https://admin.managesmartr.com" // デフォルト値
        }), { pretty: true });
        const adminEmail = getAdminEmail();
        return sendEmail(adminEmail, subject, htmlContent);
    }
}

// --- F. キャンセル通知 ---

/**
 * キャンセル通知（ユーザー・アドミン共通関数だが、内部で分岐）
 */
interface CancellationNotificationSendProps extends BookingReceivedProps {
    cancellationFee: number;
    isCustomer: boolean;
    dashboardLink?: string; // Admin用
}

export async function sendCancellationNotificationEmail(props: CancellationNotificationSendProps): Promise<boolean> {
    if (props.isCustomer) {
        // Customerへの送信
        const subject = `【Journey Forward Services】Cancellation Confirmed (No. ${props.request.requestId})`;
        const htmlContent = await render(React.createElement(CancellationNotificationCustomer, {
            customer: props.customer,
            request: props.request,
            requestDate: props.requestDate,
            cancellationFee: props.cancellationFee
        }), { pretty: true });
        return sendEmail(props.customer.email, subject, htmlContent);

    } else {
        // Adminへの送信
        const subject = `【Cancelled】Request #${props.request.requestId} - ${props.customer.lastName}`;
        const htmlContent = await render(React.createElement(CancellationNotificationAdmin, {
            customer: props.customer,
            request: props.request,
            requestDate: props.requestDate,
            cancellationFee: props.cancellationFee,
            dashboardLink: props.dashboardLink || "https://admin.managesmartr.com"
        }), { pretty: true });
        const adminEmail = getAdminEmail();
        return sendEmail(adminEmail, subject, htmlContent);
    }
}