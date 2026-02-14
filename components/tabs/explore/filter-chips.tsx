import { ThemedText } from "@/components/themed-text";
import { Chip, useThemeColor } from "heroui-native";
import { quizPacks } from "@/src/data/mockData";
import { useMemo } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface FilterChipsProps {
    chip: string;
    onChangeChip: (chip: string) => void;
}

const preferredChipOrder = [
    'React',
    'TypeScript',
    'Go',
    'Python',
    'Rust',
    '.Net',
    'Concurrency',
    'System Design',
];

const FilterChips = ({ chip, onChangeChip }: FilterChipsProps) => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');
    const foreground = useThemeColor('foreground');
    const chips = useMemo(() => {
        const dynamicValues = quizPacks.flatMap((pack) => {
            const values: string[] = [];

            if (pack.language !== 'General') {
                values.push(pack.language);
            }

            if (pack.tags?.length) {
                values.push(...pack.tags);
            }

            return values;
        });

        const available = new Set(dynamicValues);
        const orderedPreferred = preferredChipOrder.filter((item) => available.has(item));
        const additional = Array.from(available).filter((item) => !preferredChipOrder.includes(item));

        return ['All', ...orderedPreferred, ...additional];
    }, []);

    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginTop: 16, paddingVertical: 8, gap: 8 }}>
        {chips.map((item, index) => {
            const isSelected = item === chip;
            
            return <Chip 
                    key={index} 
                    size="lg" 
                    variant="soft"
                    onPress={() => onChangeChip(item)}
                    style={{
                        alignSelf: 'center',
                        borderWidth: 1,
                        paddingHorizontal: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 32, 
                        minWidth: 70,
                        borderColor: isSelected ? accent : muted + '80',
                        transform: [{
                            scale: isSelected ? 1.01 : 1
                        }]
                    }}
                >
                    {isSelected && <View style={{ backgroundColor: accent, width: 8, height: 8, borderRadius: 999 }} />}
                    <ThemedText style={{ color: isSelected ? accent : foreground, fontSize: 14, fontWeight: '800' }}>{item}</ThemedText>
                </Chip>
            })}
    </ScrollView>
}



export default FilterChips;
