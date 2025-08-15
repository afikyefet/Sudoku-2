import {
    ChatBubbleLeftIcon,
    EyeIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid';
import {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    User as UserComponent,
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { SudokuPuzzle } from '../types';

interface PuzzleCardProps {
    puzzle: SudokuPuzzle;
    onLike?: (puzzleId: string) => void;
    onShare?: (puzzle: SudokuPuzzle, platform: string) => void;
    showAuthor?: boolean;
    compact?: boolean;
}

const PuzzleCard = ({
    puzzle,
    onLike,
    onShare,
    showAuthor = true,
    compact = false
}: PuzzleCardProps) => {
    const navigate = useNavigate();

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            case 'expert': return 'secondary';
            default: return 'default';
        }
    };

    const handleCardClick = () => {
        navigate(`/puzzle/${puzzle._id}`);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(puzzle._id);
    };

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/puzzle/${puzzle._id}#comments`);
    };

    const handleShare = (platform: string) => {
        onShare?.(puzzle, platform);
    };

    return (
        <Card
            className="hover:shadow-lg transition-all duration-200 cursor-pointer"
            isPressable
            onPress={handleCardClick}
        >
            {showAuthor && (
                <CardHeader className="flex justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <Avatar
                            src={puzzle.user.avatar}
                            name={puzzle.user.displayName || puzzle.user.username}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{puzzle.title}</h3>
                                {puzzle.user.isVerified && (
                                    <Badge content="✓" color="primary" size="sm" />
                                )}
                            </div>
                            <UserComponent
                                name={puzzle.user.displayName || puzzle.user.username}
                                description={`@${puzzle.user.username}`}
                                avatarProps={{ size: "sm", src: puzzle.user.avatar }}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Chip
                            size="sm"
                            variant="flat"
                            color={getDifficultyColor(puzzle.difficulty)}
                        >
                            {puzzle.difficulty}
                        </Chip>
                        {puzzle.isFeatured && (
                            <Chip size="sm" color="warning" variant="flat">
                                Featured
                            </Chip>
                        )}
                    </div>
                </CardHeader>
            )}

            <CardBody>
                {!showAuthor && (
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{puzzle.title}</h3>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={getDifficultyColor(puzzle.difficulty)}
                        >
                            {puzzle.difficulty}
                        </Chip>
                    </div>
                )}

                {puzzle.description && !compact && (
                    <p className="text-small text-default-600 mb-3 line-clamp-2">
                        {puzzle.description}
                    </p>
                )}

                <div className={`grid grid-cols-9 gap-px bg-default-300 rounded-lg p-2 aspect-square mb-3 ${compact ? 'max-w-48 mx-auto' : ''}`}>
                    {puzzle.puzzleData.flat().map((cell, index) => (
                        <div
                            key={index}
                            className="bg-content1 flex items-center justify-center text-xs font-medium rounded-sm"
                        >
                            {cell || ''}
                        </div>
                    ))}
                </div>

                {puzzle.tags.length > 0 && !compact && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {puzzle.tags.slice(0, 3).map(tag => (
                            <Chip key={tag} size="sm" variant="flat">
                                #{tag}
                            </Chip>
                        ))}
                        {puzzle.tags.length > 3 && (
                            <Chip size="sm" variant="flat" color="default">
                                +{puzzle.tags.length - 3}
                            </Chip>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-small text-default-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {puzzle.stats.views}
                        </span>
                        <span>
                            {puzzle.stats.completions} solved
                        </span>
                    </div>
                    <span>
                        {new Date(puzzle.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </CardBody>

            <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        startContent={
                            puzzle.likes.some(like => like.user === 'current') ?
                                <HeartFilledIcon className="w-4 h-4" /> :
                                <HeartIcon className="w-4 h-4" />
                        }
                        onPress={handleLike}
                    >
                        {puzzle.likeCount || 0}
                    </Button>

                    <Button
                        size="sm"
                        variant="light"
                        startContent={<ChatBubbleLeftIcon className="w-4 h-4" />}
                        onPress={handleComment}
                    >
                        {puzzle.commentCount || 0}
                    </Button>
                </div>

                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={(e) => e.stopPropagation()}
                        >
                            <ShareIcon className="w-4 h-4" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem
                            key="copy"
                            onPress={() => handleShare('link')}
                        >
                            Copy Link
                        </DropdownItem>
                        <DropdownItem
                            key="twitter"
                            onPress={() => handleShare('twitter')}
                        >
                            Share on Twitter
                        </DropdownItem>
                        <DropdownItem
                            key="facebook"
                            onPress={() => handleShare('facebook')}
                        >
                            Share on Facebook
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </CardFooter>
        </Card>
    );
};

export default PuzzleCard;
