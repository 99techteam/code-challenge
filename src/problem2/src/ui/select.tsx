import {
  Avatar,
  HStack,
  Select as ChakraSelect,
  useSelectContext,
  type ListCollection,
} from "@chakra-ui/react";

const SelectValue = () => {
  const select = useSelectContext();
  const items = select.selectedItems as Array<{ name: string; avatar: string }>;
  const { name, avatar } = items?.[0] ?? [];
  return (
    <ChakraSelect.ValueText>
      <HStack>
        <Avatar.Root bg="rgba(192, 132, 252, 0.2)" shape="full" size="md">
          <Avatar.Image src={avatar} alt={name} />
          <Avatar.Fallback name={name} />
        </Avatar.Root>
        {name}
      </HStack>
    </ChakraSelect.ValueText>
  );
};

type TCollectionItem = {
  id: string;
  value: string;
  name: string;
  avatar: string;
};

interface IProps {
  collection: ListCollection<TCollectionItem>;
  defaultValue?: string[];
  value?: string[];
  onChange: (val: string[]) => void;
}

export const Select: React.FC<IProps> = ({
  collection,
  value,
  onChange,
  defaultValue,
}) => (
  <ChakraSelect.Root
    collection={collection}
    size="sm"
    width="240px"
    positioning={{ sameWidth: true }}
    value={value}
    defaultValue={defaultValue}
    onValueChange={(e) => onChange(e.value)}
    borderRadius="swap-def"
  >
    <ChakraSelect.HiddenSelect />
    <ChakraSelect.Control>
      <ChakraSelect.Trigger border="none">
        <SelectValue />
      </ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        <ChakraSelect.Indicator />
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
    <ChakraSelect.Positioner>
      <ChakraSelect.Content colorScheme="light">
        {collection.items.map((item) => (
          <ChakraSelect.Item
            css={{
              color: "#000000",
              fontFamily: `"DM Sans", system-ui, sans-serif`,
              fontSize: "1rem",
              fontWeight: "400",
              lineHeight: "1.25",
            }}
            item={item}
            key={item.id}
            justifyContent="flex-start"
          >
            <Avatar.Root shape="full" size="sm">
              <Avatar.Image aria-hidden src={item.avatar} alt={item.name} />
              <Avatar.Fallback name={item.name} />
            </Avatar.Root>
            {item.name}
            <ChakraSelect.ItemIndicator />
          </ChakraSelect.Item>
        ))}
      </ChakraSelect.Content>
    </ChakraSelect.Positioner>
  </ChakraSelect.Root>
);
