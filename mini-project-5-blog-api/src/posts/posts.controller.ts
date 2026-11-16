import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Query } from "@nestjs/common";

import { PostsService } from "./posts.service.js";
import { CreatePostDto } from "./dto/create-post.dto.js";
import { UpdatePostDto } from "./dto/update-post.dto.js";
import { QueryPostsDto } from "./dto/query-posts.dto.js";

@Controller("posts")
export class PostsController{
    constructor(
        private readonly postsService: PostsService,
    ) {}

    @HttpPost()
    create(@Body() body : CreatePostDto){
        return this.postsService.create(body);
    }

    @Get()
    findAll(@Query() query: QueryPostsDto){
        return this.postsService.findAll(query);
    }

    @Get(":id")
    findOne(@Param("id") id: string){
        return this.postsService.findOne(id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() body: UpdatePostDto){
        return this.postsService.update(id, body)
    }

    @Delete(":id")
    remove(@Param("id") id: string){
        return this.postsService.remove(id);
    }
}
