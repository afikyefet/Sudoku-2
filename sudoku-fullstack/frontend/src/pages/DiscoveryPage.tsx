import {
    ChatBubbleLeftIcon,
    EyeIcon,
    FireIcon,
    FunnelIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    ShareIcon,
    SparklesIcon,
    TrophyIcon,
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
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Spinner,
    Tab,
    Tabs,
    useDisclosure,
    User as UserComponent
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import { socialAPI, sudokuAPI } from '../services/api';
import { PuzzleFilters, SudokuPuzzle } from '../types';

const DiscoveryPage = () => {
    const [puzzles, setPuzzles] = useState<SudokuPuzzle[]>([]);
    const [filteredPuzzles, setFilteredPuzzles] = useState<SudokuPuzzle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState<string>('trending');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilters, setActiveFilters] = useState<PuzzleFilters>({});

    const navigate = useNavigate();
    const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure();

    useEffect(() => {
        fetchPuzzles();
    }, [selectedTab, activeFilters, currentPage]);

    useEffect(() => {
        handleSearch();
    }, [searchTerm, puzzles]);

    const fetchPuzzles = async () => {
        try {
            setIsLoading(true);

            const filters: PuzzleFilters = {
                ...activeFilters,
                sortBy: selectedTab as any,
                page: currentPage,
                limit: 12
            };

            const response = await sudokuAPI.getPublicPuzzles(filters);

            if (response.success && response.data) {
                if (currentPage === 1) {
                    setPuzzles(response.data.puzzles || []);
                } else {
                    setPuzzles(prev => [...prev, ...(response.data?.puzzles || [])]);
                }

                setHasMore(response.data.pagination?.hasNext || false);
            }
        } catch (error) {
            toast.error('Failed to fetch puzzles');
            console.error('Fetch puzzles error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredPuzzles(puzzles);
            return;
        }

        const filtered = puzzles.filter(puzzle =>
            puzzle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            puzzle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            puzzle.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            puzzle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredPuzzles(filtered);
    };

    const handleTabChange = (key: React.Key) => {
        setSelectedTab(key as string);
        setCurrentPage(1);
        setPuzzles([]);
    };

    const handleFilterChange = (filters: PuzzleFilters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
        setPuzzles([]);
        onFiltersClose();
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handleLike = async (puzzleId: string) => {
        try {
            const response = await socialAPI.toggleLike(puzzleId);
            if (response.success) {
                setPuzzles(prev => prev.map(puzzle => {
                    if (puzzle._id === puzzleId) {
                        const isLiked = response.data?.isLiked;
                        const likeCount = response.data?.likeCount || 0;

                        return {
                            ...puzzle,
                            likeCount,
                            likes: isLiked
                                ? [...puzzle.likes, { user: 'current', likedAt: new Date().toISOString() }]
                                : puzzle.likes.filter(like => like.user !== 'current')
                        };
                    }
                    return puzzle;
                }));

                setFilteredPuzzles(prev => prev.map(puzzle => {
                    if (puzzle._id === puzzleId) {
                        const isLiked = response.data?.isLiked;
                        const likeCount = response.data?.likeCount || 0;

                        return {
                            ...puzzle,
                            likeCount,
                            likes: isLiked
                                ? [...puzzle.likes, { user: 'current', likedAt: new Date().toISOString() }]
                                : puzzle.likes.filter(like => like.user !== 'current')
                        };
                    }
                    return puzzle;
                }));
            }
        } catch (error) {
            toast.error('Failed to like puzzle');
        }
    };

    const handleShare = async (puzzle: SudokuPuzzle, platform: string) => {
        try {
            const response = await socialAPI.sharePuzzle(puzzle._id, platform);
            if (response.success) {
                if (platform === 'link') {
                    await navigator.clipboard.writeText(response.data?.url || '');
                    toast.success('Link copied to clipboard!');
                } else if (platform === 'twitter' && response.data?.twitterUrl) {
                    window.open(response.data.twitterUrl, '_blank');
                } else if (platform === 'facebook' && response.data?.facebookUrl) {
                    window.open(response.data.facebookUrl, '_blank');
                }
            }
        } catch (error) {
            toast.error('Failed to share puzzle');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            case 'expert': return 'secondary';
            default: return 'default';
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'trending': return <FireIcon className="w-4 h-4" />;
            case 'newest': return <SparklesIcon className="w-4 h-4" />;
            case 'popular': return <EyeIcon className="w-4 h-4" />;
            case 'rating': return <TrophyIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const displayPuzzles = searchTerm ? filteredPuzzles : puzzles;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Discover Puzzles</h1>
                        <p className="text-default-500 mt-1">
                            Explore amazing Sudoku puzzles from the community
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search puzzles, users, tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                            className="w-full sm:w-64"
                            variant="bordered"
                        />

                        <Button
                            variant="bordered"
                            onPress={onFiltersOpen}
                            startContent={<FunnelIcon className="w-4 h-4" />}
                        >
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={handleTabChange}
                    variant="underlined"
                    className="w-full"
                >
                    <Tab
                        key="trending"
                        title={
                            <div className="flex items-center gap-2">
                                {getTabIcon('trending')}
                                <span>Trending</span>
                            </div>
                        }
                    />
                    <Tab
                        key="newest"
                        title={
                            <div className="flex items-center gap-2">
                                {getTabIcon('newest')}
                                <span>Newest</span>
                            </div>
                        }
                    />
                    <Tab
                        key="popular"
                        title={
                            <div className="flex items-center gap-2">
                                {getTabIcon('popular')}
                                <span>Popular</span>
                            </div>
                        }
                    />
                    <Tab
                        key="rating"
                        title={
                            <div className="flex items-center gap-2">
                                {getTabIcon('rating')}
                                <span>Top Rated</span>
                            </div>
                        }
                    />
                </Tabs>

                {/* Active Filters */}
                {Object.keys(activeFilters).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {activeFilters.difficulty && (
                            <Chip
                                variant="flat"
                                color={getDifficultyColor(activeFilters.difficulty)}
                                onClose={() => handleFilterChange({ ...activeFilters, difficulty: undefined })}
                            >
                                {activeFilters.difficulty}
                            </Chip>
                        )}
                        {activeFilters.category && (
                            <Chip
                                variant="flat"
                                onClose={() => handleFilterChange({ ...activeFilters, category: undefined })}
                            >
                                {activeFilters.category}
                            </Chip>
                        )}
                        {activeFilters.tags?.map(tag => (
                            <Chip
                                key={tag}
                                variant="flat"
                                onClose={() => handleFilterChange({
                                    ...activeFilters,
                                    tags: activeFilters.tags?.filter(t => t !== tag)
                                })}
                            >
                                #{tag}
                            </Chip>
                        ))}
                    </div>
                )}
            </div>

            {/* Puzzles Grid */}
            {isLoading && currentPage === 1 ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <Spinner size="lg" color="primary" />
                        <p className="mt-4 text-default-500">Discovering amazing puzzles...</p>
                    </div>
                </div>
            ) : displayPuzzles.length === 0 ? (
                <Card className="text-center py-12">
                    <CardBody>
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold mb-2">No puzzles found</h2>
                        <p className="text-default-500 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'No puzzles match your current filters'}
                        </p>
                        {searchTerm && (
                            <Button color="primary" onPress={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                        )}
                    </CardBody>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayPuzzles.map((puzzle) => (
                            <Card
                                key={puzzle._id}
                                className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                                isPressable
                                onPress={() => navigate(`/puzzle/${puzzle._id}`)}
                            >
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

                                <CardBody>
                                    {puzzle.description && (
                                        <p className="text-small text-default-600 mb-3 line-clamp-2">
                                            {puzzle.description}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-9 gap-px bg-default-300 rounded-lg p-2 aspect-square mb-3">
                                        {puzzle.puzzleData.flat().map((cell, index) => (
                                            <div
                                                key={index}
                                                className="bg-content1 flex items-center justify-center text-xs font-medium rounded-sm"
                                            >
                                                {cell || ''}
                                            </div>
                                        ))}
                                    </div>

                                    {puzzle.tags.length > 0 && (
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
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleLike(puzzle._id);
                                            }}
                                        >
                                            {puzzle.likeCount || 0}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<ChatBubbleLeftIcon className="w-4 h-4" />}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                navigate(`/puzzle/${puzzle._id}#comments`);
                                            }}
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
                                                onPress={() => handleShare(puzzle, 'link')}
                                            >
                                                Copy Link
                                            </DropdownItem>
                                            <DropdownItem
                                                key="twitter"
                                                onPress={() => handleShare(puzzle, 'twitter')}
                                            >
                                                Share on Twitter
                                            </DropdownItem>
                                            <DropdownItem
                                                key="facebook"
                                                onPress={() => handleShare(puzzle, 'facebook')}
                                            >
                                                Share on Facebook
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <Button
                                color="primary"
                                variant="bordered"
                                onPress={handleLoadMore}
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Filters Modal */}
            <Modal
                isOpen={isFiltersOpen}
                onClose={onFiltersClose}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader>Filter Puzzles</ModalHeader>
                    <ModalBody>
                        <FilterSidebar
                            filters={activeFilters}
                            onFiltersChange={handleFilterChange}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default DiscoveryPage;
