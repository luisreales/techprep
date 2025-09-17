using System;
using System.Text.RegularExpressions;

// Test script to verify log parsing regex
var testLogLine = "2025-09-16 17:02:33.499 -05:00 [WRN] The query uses a row limiting operator ('Skip'/'Take') without an 'OrderBy' operator.";

var logPattern = new Regex(@"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [+-]\d{2}:\d{2}) \[(\w{3})\] (.+)$");

Console.WriteLine($"Testing line: {testLogLine}");

var match = logPattern.Match(testLogLine);
if (match.Success)
{
    Console.WriteLine("Match succeeded!");
    Console.WriteLine($"Timestamp: {match.Groups[1].Value}");
    Console.WriteLine($"Level: {match.Groups[2].Value}");
    Console.WriteLine($"Message: {match.Groups[3].Value}");

    if (DateTime.TryParse(match.Groups[1].Value, out var timestamp))
    {
        Console.WriteLine($"Parsed timestamp: {timestamp}");
    }
    else
    {
        Console.WriteLine("Failed to parse timestamp");
    }
}
else
{
    Console.WriteLine("Match failed!");
}