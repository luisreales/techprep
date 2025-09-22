using AutoMapper;
using TechPrep.Application.DTOs.Common;
using TechPrep.Application.DTOs.PracticeInterview;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Interfaces;

namespace TechPrep.Application.Services;

public class GroupService : IGroupService
{
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public GroupService(IGroupRepository groupRepository, IMapper mapper)
    {
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginatedResponse<GroupDto>>> GetGroupsAsync(int page = 1, int pageSize = 10)
    {
        try
        {
            var groups = await _groupRepository.GetAllAsync();
            var totalCount = groups.Count();
            var pagedGroups = groups.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var groupDtos = _mapper.Map<List<GroupDto>>(pagedGroups);

            var response = new PaginatedResponse<GroupDto>
            {
                Data = groupDtos,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPrevious = page > 1
                }
            };

            return ApiResponse<PaginatedResponse<GroupDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<GroupDto>>.ErrorResponse(
                "GROUP_FETCH_ERROR", "Failed to fetch groups", ex.Message);
        }
    }

    public async Task<ApiResponse<GroupDetailDto>> GetGroupByIdAsync(int id)
    {
        try
        {
            var group = await _groupRepository.GetWithMembersAsync(id);
            if (group == null)
            {
                return ApiResponse<GroupDetailDto>.ErrorResponse(
                    "GROUP_NOT_FOUND", $"Group with ID {id} not found");
            }

            var groupDto = _mapper.Map<GroupDetailDto>(group);
            return ApiResponse<GroupDetailDto>.SuccessResponse(groupDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<GroupDetailDto>.ErrorResponse(
                "GROUP_FETCH_ERROR", "Failed to fetch group", ex.Message);
        }
    }

    public async Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto createDto)
    {
        try
        {
            var group = _mapper.Map<Group>(createDto);
            group.CreatedAt = DateTime.UtcNow;
            group.UpdatedAt = DateTime.UtcNow;

            await _groupRepository.AddAsync(group);

            var groupDto = _mapper.Map<GroupDto>(group);
            return ApiResponse<GroupDto>.SuccessResponse(groupDto, "Group created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<GroupDto>.ErrorResponse(
                "GROUP_CREATE_ERROR", "Failed to create group", ex.Message);
        }
    }

    public async Task<ApiResponse<GroupDto>> UpdateGroupAsync(int id, UpdateGroupDto updateDto)
    {
        try
        {
            var group = await _groupRepository.GetByIdAsync(id);
            if (group == null)
            {
                return ApiResponse<GroupDto>.ErrorResponse(
                    "GROUP_NOT_FOUND", $"Group with ID {id} not found");
            }

            _mapper.Map(updateDto, group);
            group.UpdatedAt = DateTime.UtcNow;

            _groupRepository.Update(group);

            var groupDto = _mapper.Map<GroupDto>(group);
            return ApiResponse<GroupDto>.SuccessResponse(groupDto, "Group updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<GroupDto>.ErrorResponse(
                "GROUP_UPDATE_ERROR", "Failed to update group", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> DeleteGroupAsync(int id)
    {
        try
        {
            var group = await _groupRepository.GetByIdAsync(id);
            if (group == null)
            {
                return ApiResponse<object>.ErrorResponse(
                    "GROUP_NOT_FOUND", $"Group with ID {id} not found");
            }

            _groupRepository.Delete(group);
            return ApiResponse<object>.SuccessResponse(null, "Group deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "GROUP_DELETE_ERROR", "Failed to delete group", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> AddMembersAsync(int groupId, AddGroupMembersDto membersDto)
    {
        try
        {
            await _groupRepository.AddMembersAsync(groupId, membersDto.UserIds, membersDto.RoleInGroup);
            return ApiResponse<object>.SuccessResponse(null, "Members added successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "ADD_MEMBERS_ERROR", "Failed to add members", ex.Message);
        }
    }

    public async Task<ApiResponse<object>> RemoveMembersAsync(int groupId, RemoveGroupMembersDto membersDto)
    {
        try
        {
            await _groupRepository.RemoveMembersAsync(groupId, membersDto.UserIds);
            return ApiResponse<object>.SuccessResponse(null, "Members removed successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.ErrorResponse(
                "REMOVE_MEMBERS_ERROR", "Failed to remove members", ex.Message);
        }
    }

    public async Task<ApiResponse<PaginatedResponse<GroupDto>>> GetMyGroupsAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        try
        {
            var groups = await _groupRepository.GetByUserIdAsync(userId);
            var totalCount = groups.Count();
            var pagedGroups = groups.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var groupDtos = _mapper.Map<List<GroupDto>>(pagedGroups);

            var response = new PaginatedResponse<GroupDto>
            {
                Data = groupDtos,
                Pagination = new PaginationInfo
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPrevious = page > 1
                }
            };

            return ApiResponse<PaginatedResponse<GroupDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            return ApiResponse<PaginatedResponse<GroupDto>>.ErrorResponse(
                "MY_GROUPS_FETCH_ERROR", "Failed to fetch user groups", ex.Message);
        }
    }
}