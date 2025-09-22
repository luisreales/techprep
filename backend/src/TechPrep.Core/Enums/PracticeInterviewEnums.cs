namespace TechPrep.Core.Enums;

public enum TemplateKind
{
    Practice = 1,
    Interview = 2
}

public enum VisibilityType
{
    Public = 1,
    Group = 2,
    Private = 3
}

public enum FeedbackMode
{
    Immediate = 1,
    End = 2
}

public enum NavigationMode
{
    Free = 1,
    Linear = 2,
    Restricted = 3
}

public enum SessionStatus
{
    NotStarted = 1,
    InProgress = 2,
    Paused = 3,
    Completed = 4,
    Expired = 5,
    Abandoned = 6
}

public enum AuditEventType
{
    FocusLost = 1,
    FocusGained = 2,
    FullscreenExit = 3,
    FullscreenEnter = 4,
    CopyAttempt = 5,
    PasteAttempt = 6,
    TabSwitch = 7,
    WindowResize = 8,
    NetworkDisconnect = 9,
    NetworkReconnect = 10
}

public enum SubscriptionStatus
{
    Active = 1,
    Expired = 2,
    Cancelled = 3,
    Suspended = 4
}

public enum CreditTransactionType
{
    Purchase = 1,
    Consumption = 2,
    Refund = 3,
    Expiration = 4,
    Bonus = 5
}