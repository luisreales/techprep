using TechPrep.Core.Enums;

namespace TechPrep.Core.Entities;

public class SessionTemplateItem
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public SessionItemType ItemType { get; set; }
    public string ItemId { get; set; } = default!;
    public int OrderIndex { get; set; }
    
    public SessionTemplate Template { get; set; } = default!;
}