import { Transform } from "class-transformer";

import { IsNotEmpty, IsString, MaxLength, ValidateIf } from "class-validator";

export class UpdateStudentDto {
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,  
    )

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;


    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({value}) => 
      typeof value === "string" ? value.trim() : value,
    )

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    course?: string;
}