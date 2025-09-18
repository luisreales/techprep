using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TechPrep.Application.Services;
using MailKit.Security;

namespace TechPrep.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailConfirmationAsync(string email, string confirmationLink)
    {
        var subject = "Confirm your TechPrep account";
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #4f46e5;'>Welcome to TechPrep!</h2>
                <p>Thank you for registering with TechPrep. To complete your registration, please confirm your email address by clicking the link below:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{confirmationLink}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
                        Confirm Email Address
                    </a>
                </div>
                <p>If you didn't create this account, you can safely ignore this email.</p>
                <p>Best regards,<br>The TechPrep Team</p>
            </div>";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetAsync(string email, string resetLink)
    {
        var subject = "Reset your TechPrep password";
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #4f46e5;'>Password Reset Request</h2>
                <p>You requested a password reset for your TechPrep account. Click the link below to reset your password:</p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{resetLink}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
                        Reset Password
                    </a>
                </div>
                <p>This link will expire in 24 hours for security reasons.</p>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <p>Best regards,<br>The TechPrep Team</p>
            </div>";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName)
    {
        var subject = "Welcome to TechPrep!";
        var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #4f46e5;'>Welcome to TechPrep, {firstName}!</h2>
                <p>Your account has been successfully verified. You're now ready to start your technical interview preparation journey!</p>
                <h3>What you can do now:</h3>
                <ul>
                    <li>Practice with our extensive question bank</li>
                    <li>Take mock interviews</li>
                    <li>Track your progress</li>
                    <li>Access learning resources</li>
                </ul>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{_configuration["Frontend:BaseUrl"]}/dashboard' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;'>
                        Get Started
                    </a>
                </div>
                <p>Best regards,<br>The TechPrep Team</p>
            </div>";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];
            var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

            // For development, check if we should use real SMTP or just log
            if (smtpServer == "localhost")
            {
                _logger.LogInformation("EMAIL (Development Mode) - To: {ToEmail}, Subject: {Subject}", toEmail, subject);
                _logger.LogInformation("EMAIL Body: {Body}", body);
                return;
            }

            // Create the email message using MimeKit
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName ?? "TechPrep", fromEmail ?? "noreply@techprep.com"));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            // Set the HTML body
            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

            // Send the email using MailKit
            using var client = new SmtpClient();

            // Connect to the SMTP server
            await client.ConnectAsync(smtpServer, smtpPort, enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

            // Authenticate if credentials are provided
            var username = emailSettings["SmtpUsername"];
            var password = emailSettings["SmtpPassword"];
            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                await client.AuthenticateAsync(username, password);
            }

            // Send the message
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {ToEmail} using MailKit", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail} using MailKit", toEmail);
            throw;
        }
    }
}