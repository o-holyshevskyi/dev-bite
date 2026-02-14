import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input, TextField, useThemeColor } from "heroui-native";
import { Pressable, View } from "react-native";
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(IconSymbol);

interface SearchBarProps {
    value: string;
    onChangeText: (value: string) => void;
    onClearText: () => void;
}

const SearchBar = ({ value, onChangeText, onClearText }: SearchBarProps) => {
    const accent = useThemeColor('accent');
    const muted = useThemeColor('muted');

    const handleChangeText = (text: string) => onChangeText(text);

    return (
        <View>
            <TextField>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}
                >
                    <Input 
                        placeholder="Search ..."
                        style={{
                            fontWeight: 'bold',
                            fontSize: 22,
                            borderWidth: 1,
                            borderColor: accent,
                            flex: 1,
                            backgroundColor: accent + '20'
                        }}
                        value={value}
                        onChangeText={handleChangeText}
                        keyboardType="default"
                    />
                    { value &&
                        <Pressable
                            style={{
                                position: 'absolute',
                                right: 8
                            }}
                            onPress={onClearText}
                        >
                            <StyledIonicons
                                name={'x.circle'}
                                size={24}
                                color={muted}
                            />
                        </Pressable>
                    }
                </View>
            </TextField>
        </View>
    )
}

export default SearchBar;
