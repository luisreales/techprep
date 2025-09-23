namespace TechPrep.Core.Enums;

public enum IntegrityViolationType
{
    FocusLoss = 1,
    FullscreenExit = 2,
    TabSwitch = 3,
    CopyAttempt = 4,
    PasteAttempt = 5,
    RightClick = 6,
    DevToolsOpen = 7,
    NavigationAttempt = 8,
    ScreenRecordingDetected = 9,
    MultipleWindows = 10,
    SuspiciousActivity = 11
}