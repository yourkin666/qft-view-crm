import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, pageSize?: number, search?: string, roleId?: string, isActive?: string, orderBy?: string): Promise<{
        success: boolean;
        data: {
            data: {
                role: import("@prisma/client/runtime").GetResult<{
                    id: number;
                    name: string;
                    description: string | null;
                }, unknown> & {};
                id: number;
                username: string;
                fullName: string;
                phone: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                roleId: number;
            }[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            role: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                description: string | null;
            }, unknown> & {};
            id: number;
            username: string;
            fullName: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            roleId: number;
        };
    }>;
    getUserStatistics(id: number): Promise<{
        success: boolean;
        data: {
            viewingRecordsCount: number;
            apiKeysCount: number;
        };
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: {
            role: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                description: string | null;
            }, unknown> & {};
            id: number;
            username: string;
            fullName: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            roleId: number;
        };
    }>;
    batchUpdate(batchUpdateDto: {
        ids: number[];
        data: Partial<UpdateUserDto>;
    }): Promise<{
        success: boolean;
        data: {
            message: string;
            updatedCount: number;
        };
    }>;
    resetPassword(id: number): Promise<{
        success: boolean;
        data: {
            message: string;
            tempPassword: string;
        };
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: {
            role: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                description: string | null;
            }, unknown> & {};
            id: number;
            username: string;
            fullName: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            roleId: number;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    batchDelete(batchDeleteDto: {
        ids: number[];
    }): Promise<{
        success: boolean;
        data: {
            message: string;
            deletedCount: number;
        };
    }>;
}
