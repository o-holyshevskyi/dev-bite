import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { Button, Label, RadioGroup, useThemeColor } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import CodeHighlighter from "react-native-code-highlighter";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { anOldHope as style } from "react-syntax-highlighter/dist/esm/styles/hljs";

const answers = [
    {
        id: 1,
        description: 'Return type must include null',
        isCorrect: false,
    },
    {
        id: 2,
        description: 'Name cannot be assigned null',
        isCorrect: true,
    },
    {
        id: 3,
        description: 'Function is missing return type',
        isCorrect: false,
    }
];

export default function ModalLayout() {
    const muted = useThemeColor('muted');
    const accent = useThemeColor('accent');
    const danger = useThemeColor('danger');
    const background = useThemeColor('background');

    const [value, setValue] = useState<undefined | string>(undefined);
    const [checked, setChecked] = useState(false);

    const correctAnswerId = answers.find(a => a.isCorrect)?.id.toString();

    const handleCheckAnswer = () => {
        setChecked(true);
    };

    return (
        <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '600', color: muted, textTransform: 'uppercase' }}>Question 3 of 5</ThemedText>
                <ThemedText style={{ fontSize: 18, fontWeight: '600', color: accent, textTransform: 'uppercase' }}>60%</ThemedText>        
            </View>
            <View style={{ marginTop: 16, width: '100%' }}>
                <View
                    style={{
                        height: 8,
                        width: '100%',
                        borderRadius: 4,
                        backgroundColor: accent + '40',
                        overflow: 'hidden',
                    }}
                >
                    <View
                        style={{
                            height: '100%',
                            width: `60%`,
                            backgroundColor: accent,
                        }}
                    />
                </View>
            </View>
            <ScrollView contentContainerStyle={{ marginTop: 22, gap: 24 }}>
                <ThemedText style={{ fontSize: 16, color: muted }}>Identify the error in the following TypeScript function.</ThemedText>
                <View className="flex-col rounded-xl overflow-hidden bg-code-bg border border-white/5 shadow-2xl relative group">
                    <View className="flex-row justify-between items-center gap-2 px-4 py-3 bg-[#25262a] border-b border-white/5">
                        <View className="flex-row gap-1">
                            <View className="size-3 rounded-full bg-[#ff5f56]"></View>
                            <View className="size-3 rounded-full bg-[#ffbd2e]"></View>
                            <View className="size-3 rounded-full bg-[#27c93f]"></View>
                        </View>
                        <ThemedText style={{ color: muted }}>snippet.ts</ThemedText>
                    </View>
                    <CodeHighlighter
                        language="javascript"
                        hljsStyle={style}
                        scrollViewProps={{
                            contentContainerStyle: {
                                padding: 8,
                                minWidth: "100%",
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10,
                            },
                            style: {
                                backgroundColor: background,
                            },
                        }}
                        textStyle={{
                            fontSize: 22
                        }}
                        wrapLongLines
                    >
                        {'interface User {\n  id: number;\n  name: string \n}\n\nconst getUser = (id: number): User => {\n  //Intentional bug below\n  ...\n}'}
                    </CodeHighlighter>
                </View>
                <View>
                    <RadioGroup value={value} onValueChange={setValue}>
                        {answers.map((item, index) => {
                            const id = item.id.toString();
                            const isSelected = value === id;
                            const isCorrect = checked && id === correctAnswerId;
                            const isWrong = checked && isSelected && id !== correctAnswerId;

                            return (
                            <RadioGroup.Item
                                key={index}
                                value={id}
                                style={{
                                backgroundColor: muted + '10',
                                padding: 12,
                                borderRadius: 12,
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                borderWidth: 1,
                                borderColor: isCorrect
                                    ? accent
                                    : isWrong
                                    ? danger
                                    : isSelected
                                    ? muted
                                    : muted + '20',
                                }}
                            >
                                <RadioGroup.Indicator>
                                {isSelected && (
                                    <Animated.View entering={FadeIn}>
                                    <IconSymbol
                                        name={'checkmark'}
                                        size={12}
                                        color={'white'}
                                    />
                                    </Animated.View>
                                )}
                                </RadioGroup.Indicator>

                                <View>
                                <Label>{item.description}</Label>
                                </View>
                            </RadioGroup.Item>
                            );
                        })}
                        </RadioGroup>
                </View>
                <View>
                    <Button isDisabled={value === undefined} onPress={handleCheckAnswer}>
                        <Button.Label style={{ fontWeight: 'bold' }}>
                            Check Answer
                        </Button.Label>
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
}


