using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;

namespace TechPrep.Application.Interfaces;

public interface IGroupService
{
    Task<ApiResponse<PaginatedResponse<GroupDto>>> GetGroupsAsync(int page = 1, int pageSize = 10);
    Task<ApiResponse<GroupDetailDto>> GetGroupByIdAsync(int id);
    Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto createDto);
    Task<ApiResponse<GroupDto>> UpdateGroupAsync(int id, UpdateGroupDto updateDto);
    Task<ApiResponse<object>> DeleteGroupAsync(int id);
    Task<ApiResponse<object>> AddMembersAsync(int groupId, AddGroupMembersDto membersDto);
    Task<ApiResponse<object>> RemoveMembersAsync(int groupId, RemoveGroupMembersDto membersDto);
    Task<ApiResponse<PaginatedResponse<GroupDto>>> GetMyGroupsAsync(Guid userId, int page = 1, int pageSize = 10);
}