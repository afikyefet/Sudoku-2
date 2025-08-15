import { PlusIcon } from '@heroicons/react/24/outline';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { PuzzleFilters } from '../types';

interface FilterSidebarProps {
    filters: PuzzleFilters;
    onFiltersChange: (filters: PuzzleFilters) => void;
}

const FilterSidebar = ({ filters, onFiltersChange }: FilterSidebarProps) => {
    const [localFilters, setLocalFilters] = useState<PuzzleFilters>(filters);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleDifficultyChange = (value: string) => {
        const newFilters = { ...localFilters };
        if (value) {
            newFilters.difficulty = value as any;
        } else {
            delete newFilters.difficulty;
        }
        setLocalFilters(newFilters);
    };

    const handleCategoryChange = (value: string) => {
        const newFilters = { ...localFilters };
        if (value) {
            newFilters.category = value as any;
        } else {
            delete newFilters.category;
        }
        setLocalFilters(newFilters);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !localFilters.tags?.includes(newTag.trim())) {
            const newFilters = {
                ...localFilters,
                tags: [...(localFilters.tags || []), newTag.trim()]
            };
            setLocalFilters(newFilters);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newFilters = {
            ...localFilters,
            tags: localFilters.tags?.filter(tag => tag !== tagToRemove)
        };
        if (newFilters.tags?.length === 0) {
            delete newFilters.tags;
        }
        setLocalFilters(newFilters);
    };

    const handleApplyFilters = () => {
        onFiltersChange(localFilters);
    };

    const handleClearFilters = () => {
        setLocalFilters({});
        onFiltersChange({});
    };

    const hasFilters = Object.keys(localFilters).length > 0;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex justify-between">
                    <h3 className="text-lg font-semibold">Difficulty</h3>
                </CardHeader>
                <CardBody>
                    <Select
                        placeholder="Select difficulty"
                        selectedKeys={localFilters.difficulty ? [localFilters.difficulty] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handleDifficultyChange(value);
                        }}
                        variant="bordered"
                    >
                        <SelectItem key="easy" value="easy">Easy</SelectItem>
                        <SelectItem key="medium" value="medium">Medium</SelectItem>
                        <SelectItem key="hard" value="hard">Hard</SelectItem>
                        <SelectItem key="expert" value="expert">Expert</SelectItem>
                    </Select>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Category</h3>
                </CardHeader>
                <CardBody>
                    <Select
                        placeholder="Select category"
                        selectedKeys={localFilters.category ? [localFilters.category] : []}
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            handleCategoryChange(value);
                        }}
                        variant="bordered"
                    >
                        <SelectItem key="classic" value="classic">Classic</SelectItem>
                        <SelectItem key="themed" value="themed">Themed</SelectItem>
                        <SelectItem key="challenge" value="challenge">Challenge</SelectItem>
                        <SelectItem key="community" value="community">Community</SelectItem>
                    </Select>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Tags</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddTag();
                                }
                            }}
                            variant="bordered"
                            size="sm"
                        />
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            isIconOnly
                            onPress={handleAddTag}
                            isDisabled={!newTag.trim()}
                        >
                            <PlusIcon className="w-4 h-4" />
                        </Button>
                    </div>

                    {localFilters.tags && localFilters.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {localFilters.tags.map(tag => (
                                <Chip
                                    key={tag}
                                    variant="flat"
                                    onClose={() => handleRemoveTag(tag)}
                                >
                                    #{tag}
                                </Chip>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <Divider />

            <div className="flex flex-col gap-3">
                <Button
                    color="primary"
                    onPress={handleApplyFilters}
                    className="w-full"
                >
                    Apply Filters
                </Button>

                {hasFilters && (
                    <Button
                        variant="bordered"
                        onPress={handleClearFilters}
                        className="w-full"
                    >
                        Clear All Filters
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FilterSidebar;
