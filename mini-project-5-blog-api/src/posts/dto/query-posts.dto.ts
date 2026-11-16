import { Transform, Type } from "class-transformer";

import { IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class QueryPostsDto{
    @IsOptional()
    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,
    )
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @Transform(({value}) => 
      typeof value === "string" ? value.trim().toLowerCase() : value,
    )
    @IsString()
    @MaxLength(50)
    category?: string;

    @IsOptional()
    @IsMongoId()
    authorId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsIn(["asc", "desc"])
    order?: "asc" | "desc"
}