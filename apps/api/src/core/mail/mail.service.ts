import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Brevo from '@getbrevo/brevo'
import { shouldSkipEmail } from '../../shared/utils/email.utils'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)
	private readonly apiInstance: Brevo.TransactionalEmailsApi
	private readonly fromEmail: string
	private readonly fromName: string
	private readonly frontendUrl: string

	constructor(private readonly configService: ConfigService) {
		const apiKey = this.configService.get<string>('mail.brevoApiKey')
		this.fromEmail = this.configService.get<string>('mail.fromEmail')!
		this.fromName = this.configService.get<string>('mail.fromName')!
		this.frontendUrl = this.configService.get<string>('frontendUrl')!

		this.apiInstance = new Brevo.TransactionalEmailsApi()
		
		if (apiKey) {
			this.apiInstance.setApiKey(
				Brevo.TransactionalEmailsApiApiKeys.apiKey,
				apiKey,
			)
		}
	}

	async sendVerificationEmail(
		email: string,
		name: string,
		token: string,
		user?: { oauthProvider?: string | null },
	): Promise<boolean> {
		// Skip sending email if it's a Telegram placeholder email
		if (shouldSkipEmail(email, user)) {
			this.logger.log(
				`Verification email skipped for Telegram placeholder email: ${email}. Email is already verified for Telegram OAuth users.`,
			)
			return true // Return true to not break the flow
		}

		const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`

		const sendSmtpEmail = new Brevo.SendSmtpEmail()
		sendSmtpEmail.subject = 'Подтвердите ваш email — ProRab.space'
		sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName }
		sendSmtpEmail.to = [{ email, name: name || email }]
		sendSmtpEmail.htmlContent = this.getVerificationEmailTemplate(
			name || 'Пользователь',
			verificationUrl,
		)

		try {
			await this.apiInstance.sendTransacEmail(sendSmtpEmail)
			this.logger.log(`Verification email sent to ${email}`)
			return true
		} catch (error) {
			this.logger.error(`Failed to send verification email to ${email}`, error)
			// In development, log the URL instead
			if (this.configService.get('nodeEnv') === 'development') {
				this.logger.log(`DEV: Verification URL: ${verificationUrl}`)
			}
			return false
		}
	}

	async sendPasswordResetEmail(
		email: string,
		name: string,
		token: string,
		user?: { oauthProvider?: string | null },
	): Promise<boolean> {
		// Skip sending email if it's a Telegram placeholder email
		if (shouldSkipEmail(email, user)) {
			this.logger.log(
				`Password reset email skipped for Telegram placeholder email: ${email}. Telegram users should use Telegram login.`,
			)
			return true // Return true to not break the flow (but user won't receive email)
		}

		const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`

		const sendSmtpEmail = new Brevo.SendSmtpEmail()
		sendSmtpEmail.subject = 'Сброс пароля — ProRab.space'
		sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName }
		sendSmtpEmail.to = [{ email, name: name || email }]
		sendSmtpEmail.htmlContent = this.getPasswordResetEmailTemplate(
			name || 'Пользователь',
			resetUrl,
		)

		try {
			await this.apiInstance.sendTransacEmail(sendSmtpEmail)
			this.logger.log(`Password reset email sent to ${email}`)
			return true
		} catch (error) {
			this.logger.error(`Failed to send password reset email to ${email}`, error)
			// In development, log the URL instead
			if (this.configService.get('nodeEnv') === 'development') {
				this.logger.log(`DEV: Reset URL: ${resetUrl}`)
			}
			return false
		}
	}

	async sendEmailChangeConfirmationEmail(
		email: string,
		name: string,
		token: string,
		oldEmail: string,
	): Promise<boolean> {
		const confirmationUrl = `${this.frontendUrl}/auth/confirm-email-change?token=${token}`

		const sendSmtpEmail = new Brevo.SendSmtpEmail()
		sendSmtpEmail.subject = 'Подтвердите изменение email — ProRab.space'
		sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName }
		sendSmtpEmail.to = [{ email, name: name || email }]
		sendSmtpEmail.htmlContent = this.getEmailChangeConfirmationTemplate(
			name || 'Пользователь',
			confirmationUrl,
			oldEmail,
			email,
		)

		try {
			await this.apiInstance.sendTransacEmail(sendSmtpEmail)
			this.logger.log(`Email change confirmation email sent to ${email}`)
			return true
		} catch (error) {
			this.logger.error(`Failed to send email change confirmation email to ${email}`, error)
			// In development, log the URL instead
			if (this.configService.get('nodeEnv') === 'development') {
				this.logger.log(`DEV: Confirmation URL: ${confirmationUrl}`)
			}
			return false
		}
	}

	private getVerificationEmailTemplate(name: string, url: string): string {
		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: bold; font-size: 24px; padding: 12px 20px; border-radius: 12px;">PR</div>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">Подтвердите ваш email</h1>
    
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Привет, ${name}!<br><br>
      Спасибо за регистрацию в ProRab.space. Для завершения регистрации подтвердите ваш email, нажав на кнопку ниже.
    </p>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Подтвердить email
      </a>
    </div>
    
    <p style="color: #999999; font-size: 14px; line-height: 1.6;">
      Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
      <a href="${url}" style="color: #f59e0b; word-break: break-all;">${url}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
    
    <p style="color: #999999; font-size: 12px; text-align: center;">
      Это письмо отправлено автоматически. Если вы не регистрировались на ProRab.space, просто проигнорируйте его.
    </p>
  </div>
</body>
</html>
`
	}

	private getEmailChangeConfirmationTemplate(
		name: string,
		url: string,
		oldEmail: string,
		newEmail: string,
	): string {
		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: bold; font-size: 24px; padding: 12px 20px; border-radius: 12px;">PR</div>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">Подтвердите изменение email</h1>
    
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Привет, ${name}!<br><br>
      Вы запросили изменение email адреса для вашего аккаунта ProRab.space.
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 8px;">
      <p style="color: #374151; font-size: 14px; margin: 0; margin-bottom: 8px;">
        <strong>Текущий email:</strong> ${oldEmail}
      </p>
      <p style="color: #374151; font-size: 14px; margin: 0;">
        <strong>Новый email:</strong> ${newEmail}
      </p>
    </div>
    
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Для подтверждения изменения нажмите на кнопку ниже. После подтверждения ваш старый email будет заменён на новый.
    </p>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Подтвердить изменение email
      </a>
    </div>
    
    <p style="color: #999999; font-size: 14px; line-height: 1.6;">
      Ссылка действительна в течение 24 часов.<br><br>
      Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
      <a href="${url}" style="color: #f59e0b; word-break: break-all;">${url}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
    
    <p style="color: #999999; font-size: 12px; text-align: center;">
      Если вы не запрашивали изменение email, просто проигнорируйте это письмо. Ваш email останется без изменений.
    </p>
  </div>
</body>
</html>
`
	}

	private getPasswordResetEmailTemplate(name: string, url: string): string {
		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: bold; font-size: 24px; padding: 12px 20px; border-radius: 12px;">PR</div>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">Сброс пароля</h1>
    
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Привет, ${name}!<br><br>
      Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы создать новый пароль.
    </p>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Сбросить пароль
      </a>
    </div>
    
    <p style="color: #999999; font-size: 14px; line-height: 1.6;">
      Ссылка действительна в течение 1 часа.<br><br>
      Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
      <a href="${url}" style="color: #f59e0b; word-break: break-all;">${url}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
    
    <p style="color: #999999; font-size: 12px; text-align: center;">
      Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.
    </p>
  </div>
</body>
</html>
`
	}

	async sendTeamInviteEmail(
		email: string,
		teamName: string,
		inviterName: string,
		inviteCode: string,
		inviteUrl: string,
	): Promise<boolean> {
		// Skip sending email if it's a Telegram placeholder email
		const { isTelegramPlaceholderEmail } = await import('../../shared/utils/email.utils');
		if (isTelegramPlaceholderEmail(email)) {
			this.logger.log(
				`Team invite email skipped for Telegram placeholder email: ${email}. Cannot send emails to Telegram placeholder addresses.`,
			)
			return false // Return false because we can't invite Telegram users via email
		}

		const sendSmtpEmail = new Brevo.SendSmtpEmail()
		sendSmtpEmail.subject = `Приглашение в команду "${teamName}" — ProRab.space`
		sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName }
		sendSmtpEmail.to = [{ email, name: email }]
		sendSmtpEmail.htmlContent = this.getTeamInviteEmailTemplate(
			teamName,
			inviterName,
			inviteCode,
			inviteUrl,
		)

		try {
			await this.apiInstance.sendTransacEmail(sendSmtpEmail)
			this.logger.log(`Team invite email sent to ${email} for team ${teamName}`)
			return true
		} catch (error) {
			this.logger.error(`Failed to send team invite email to ${email}`, error)
			// In development, log the URL instead
			if (this.configService.get('nodeEnv') === 'development') {
				this.logger.log(`DEV: Invite URL: ${inviteUrl}`)
				this.logger.log(`DEV: Invite Code: ${inviteCode}`)
			}
			return false
		}
	}

	private getTeamInviteEmailTemplate(
		teamName: string,
		inviterName: string,
		inviteCode: string,
		inviteUrl: string,
	): string {
		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: bold; font-size: 24px; padding: 12px 20px; border-radius: 12px;">PR</div>
    </div>
    
    <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px; text-align: center;">Приглашение в команду</h1>
    
    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Привет!<br><br>
      <strong>${inviterName}</strong> приглашает вас присоединиться к команде <strong>"${teamName}"</strong> в ProRab.space.
    </p>
    
    <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
      <p style="color: #666666; font-size: 14px; margin-bottom: 10px;">Код приглашения:</p>
      <div style="background: white; border: 2px dashed #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 15px;">
        <code style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1a1a1a; font-family: 'Courier New', monospace;">${inviteCode}</code>
      </div>
      <p style="color: #999999; font-size: 12px; margin: 0;">
        Используйте этот код для присоединения к команде
      </p>
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
        Присоединиться к команде
      </a>
    </div>
    
    <p style="color: #999999; font-size: 14px; line-height: 1.6;">
      Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
      <a href="${inviteUrl}" style="color: #f59e0b; word-break: break-all;">${inviteUrl}</a>
    </p>
    
    <div style="background: #fff7ed; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 30px;">
      <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
        <strong>Что такое ProRab.space?</strong><br>
        Это платформа для управления строительными бригадами, проектами, расходами и выплатами. Присоединившись к команде, вы сможете отслеживать свою работу и получать выплаты.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
    
    <p style="color: #999999; font-size: 12px; text-align: center;">
      Если вы не ожидали это приглашение, просто проигнорируйте это письмо.
    </p>
  </div>
</body>
</html>
`
	}
}

