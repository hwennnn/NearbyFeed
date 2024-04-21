import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  type Comment as CommentEntity,
  type CommentLike,
  type Post as PostEntity,
  type PostLike,
} from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { type TokenUser } from 'src/auth/entities';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { imageUploadOptions } from 'src/images/constants';
import { ImagesService } from 'src/images/images.service';
import {
  CreateCommentDto,
  GetCommentDto,
  GetPostDto,
  UpdateCommentDto,
  UpdatePostDto,
} from 'src/posts/dto';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { LikeDto } from 'src/posts/dto/like.dto';
import { type PostWithLike } from 'src/posts/entities';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PostEntity> {
    let image: string | undefined;

    if (file !== undefined) {
      image = await this.imagesService.uploadImage(file);
    }

    return await this.postsService.createPost(createPostDto, +userId, image);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query() getPostDto: GetPostDto,
    @GetUser() user: TokenUser | null,
  ): Promise<{ posts: PostWithLike[]; hasMore: boolean }> {
    const parsedDto: GetPostDto = {
      latitude: +getPostDto.latitude,
      longitude: +getPostDto.longitude,
      distance: +getPostDto.distance,
      userId: user?.userId,
      cursor: getPostDto.cursor,
      take: getPostDto.take !== undefined ? +getPostDto.take : undefined,
    };

    return await this.postsService.findNearbyPosts(parsedDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return await this.postsService.updatePost(+postId, updatePostDto);
  }

  @Put(':id/vote')
  @UseGuards(JwtAuthGuard)
  async votePost(
    @GetUser('userId') userId: string,
    @Param('id') postId: string,
    @Body() likeDto: LikeDto,
  ): Promise<{
    like: PostLike;
    post: PostEntity;
  }> {
    return await this.postsService.votePost(+userId, +postId, likeDto.value);
  }

  @Post(':id/comments/:parentCommentId?')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('userId') userId: string,
    @Param('id') postId: string,
    @Param('parentCommentId') parentCommentId?: string,
  ): Promise<CommentEntity> {
    return await this.postsService.createComment(
      createCommentDto,
      +postId,
      +userId,
      parentCommentId !== undefined ? +parentCommentId : undefined,
    );
  }

  @Get(':id/comments')
  async findComments(
    @Param('id') postId: string,
    @Query() getCommentDto: GetCommentDto,
    @GetUser() user: TokenUser | null,
  ): Promise<{ comments: CommentEntity[]; hasMore: boolean }> {
    const parsedDto: GetCommentDto = {
      cursor: getCommentDto.cursor,
      take: getCommentDto.take !== undefined ? +getCommentDto.take : undefined,
      sort: getCommentDto.sort,
      userId: user?.userId,
    };

    return await this.postsService.findComments(+postId, parsedDto);
  }

  @Patch(':postId/comments/:id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    return await this.postsService.updateComment(+commentId, updateCommentDto);
  }

  @Put(':postId/comments/:commentId/vote')
  @UseGuards(JwtAuthGuard)
  async voteComment(
    @GetUser('userId') userId: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() likeDto: LikeDto,
  ): Promise<{
    like: CommentLike;
    comment: CommentEntity;
  }> {
    return await this.postsService.voteComment(
      +userId,
      +postId,
      +commentId,
      likeDto.value,
    );
  }
}
