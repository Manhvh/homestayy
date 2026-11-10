import transporter from '../configs/nodemailer.js';

const isMailConfigured = () =>
    Boolean(process.env.SENDER_EMAIL && process.env.SMTP_USER && process.env.SMTP_PASS);

const safeSendMail = async ({ to, subject, html }, logContext = 'Send email') => {
    if (!to || !isMailConfigured()) return false;
    try {
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.warn(`${logContext} skipped:`, error.message);
        return false;
    }
};

export const sendVerificationEmail = async ({ email, username, code }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #1d4ed8; margin-top: 0;">Xác thực tài khoản HomeStay</h2>
            <p>Xin chào <strong>${username || email}</strong>,</p>
            <p>Mã xác thực để hoàn tất đăng ký tài khoản của bạn là:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 14px 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
                ${code}
            </div>
            <p style="font-size: 12px; color: #6b7280;">Mã có hiệu lực trong vòng 1 phút.</p>
        </div>
    `;
    return safeSendMail(
        {
            to: email,
            subject: 'HomeStay - Mã xác thực đăng ký tài khoản',
            html,
        },
        'Send verify code email'
    );
};

export const sendPasswordResetEmail = async ({ email, username, code }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #1d4ed8; margin-top: 0;">Đặt lại mật khẩu HomeStay</h2>
            <p>Xin chào <strong>${username || email}</strong>,</p>
            <p>Mã xác thực để đặt lại mật khẩu tài khoản của bạn là:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 14px 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
                ${code}
            </div>
            <p style="font-size: 12px; color: #6b7280;">Mã có hiệu lực trong vòng 1 phút.</p>
        </div>
    `;
    return safeSendMail(
        {
            to: email,
            subject: 'HomeStay - Mã xác thực đặt lại mật khẩu',
            html,
        },
        'Send reset password email'
    );
};

export const sendBookingCreatedEmail = async ({ user, booking, hotel, totalPrice }) => {
    const currency = process.env.CURRENCY || 'VNĐ';
    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px;">
                <h2 style="color: #2c3e50;">Đặt phòng HomeStay thành công!</h2>
                <p>Xin chào <strong>${user.username}</strong>,</p>
                <p>Đơn đặt phòng của bạn đã được ghi nhận thành công với thông tin chi tiết:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr><td style="padding: 6px 0;"><strong>Mã đặt phòng:</strong></td><td>#${booking.bookingCode}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Homestay:</strong></td><td>${hotel.name}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Địa chỉ:</strong></td><td>${hotel.address}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Nhận phòng:</strong></td><td>${new Date(booking.checkInDate).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Trả phòng:</strong></td><td>${new Date(booking.checkOutDate).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Tổng tiền:</strong></td><td>${Number(totalPrice).toLocaleString('vi-VN')} ${currency}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Thanh toán:</strong></td><td>Trực tiếp tại Homestay khi nhận phòng</td></tr>
                </table>
                <p style="margin-top: 20px;">Chúc bạn có một kỳ nghỉ thật tuyệt vời!</p>
            </div>
        </div>
    `;
    return safeSendMail(
        {
            to: user?.email,
            subject: 'HomeStay - Xác nhận đặt phòng thành công',
            html,
        },
        'Booking created email'
    );
};

export const sendBookingConfirmedEmail = async ({ user, hotel, codeDisplay }) => {
    const html = `<p>Xin chào <strong>${user.username}</strong>, đơn đặt phòng #${codeDisplay} tại <strong>${hotel.name}</strong> của bạn đã được xác nhận!</p>`;
    return safeSendMail(
        {
            to: user?.email,
            subject: `HomeStay - Đơn đặt phòng #${codeDisplay} đã được xác nhận`,
            html,
        },
        'Confirm booking mail'
    );
};

export const sendBookingDetailsEmail = async ({ booking, codeDisplay }) => {
    const currency = process.env.CURRENCY || 'VNĐ';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #1d4ed8;">Xác nhận thông tin đặt phòng #${codeDisplay}</h2>
            <p>Xin chào <strong>${booking.user?.username || 'Quý khách'}</strong>,</p>
            <p>Thông tin đơn đặt phòng của bạn tại <strong>${booking.hotel?.name || 'Homestay'}</strong>:</p>
            <ul>
                <li>Mã đặt phòng: <strong>#${codeDisplay}</strong></li>
                <li>Phòng: ${booking.room?.roomType || 'Phòng tiêu chuẩn'}</li>
                <li>Nhận phòng: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
                <li>Trả phòng: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
                <li>Tổng tiền: ${Number(booking.totalPrice).toLocaleString('vi-VN')} ${currency}</li>
            </ul>
        </div>
    `;
    return safeSendMail(
        {
            to: booking.user?.email,
            subject: `HomeStay - Thông tin đơn đặt phòng #${codeDisplay}`,
            html,
        },
        'Send booking mail'
    );
};
