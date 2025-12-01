import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Brevo from '@getbrevo/brevo'

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
	): Promise<boolean> {
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
	): Promise<boolean> {
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
}

