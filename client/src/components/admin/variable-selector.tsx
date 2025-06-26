import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, Code2Icon } from "lucide-react";
import { useState } from "react";

// Define available template variables by category
const TEMPLATE_VARIABLES = [
  {
    category: "User",
    items: [
      {
        id: "user.name",
        display: "User Name",
        value: "{{user.name}}",
        description: "Full name of the user",
      },
      {
        id: "user.email",
        display: "User Email",
        value: "{{user.email}}",
        description: "Email address of the user",
      },
      {
        id: "user.phone",
        display: "User Phone",
        value: "{{user.phone}}",
        description: "Phone number of the user",
      },
    ],
  },
  {
    category: "Booking",
    items: [
      {
        id: "booking.date",
        display: "Booking Date",
        value: "{{booking.date}}",
        description: "Date of the booking",
      },
      {
        id: "booking.time",
        display: "Booking Time",
        value: "{{booking.time}}",
        description: "Time of the booking",
      },
      {
        id: "booking.purpose",
        display: "Booking Purpose",
        value: "{{booking.purpose}}",
        description: "Purpose of booking",
      },
      {
        id: "booking.id",
        display: "Booking ID",
        value: "{{booking.id}}",
        description: "Unique identifier for the booking",
      },
    ],
  },
  {
    category: "Building",
    items: [
      {
        id: "building.name",
        display: "Building Name",
        value: "{{building.name}}",
        description: "Name of the building",
      },
      {
        id: "building.address",
        display: "Building Address",
        value: "{{building.address}}",
        description: "Address of the building",
      },
      {
        id: "building.phone",
        display: "Building Phone",
        value: "{{building.phone}}",
        description: "Contact phone of the building",
      },
      {
        id: "building.email",
        display: "Building Email",
        value: "{{building.email}}",
        description: "Contact email of the building",
      },
    ],
  },
  {
    category: "Actions",
    items: [
      {
        id: "action.cancelUrl",
        display: "Cancel URL",
        value: "{{cancelUrl}}",
        description: "URL to cancel the booking",
      },
    ],
  },
];

interface TemplateVariableSelectorProps {
  onSelectVariable: (variable: string) => void;
  sideOffset?: number;
  compact?: boolean;
}

export function TemplateVariableSelector({
  onSelectVariable,
  sideOffset = 4,
  compact = false,
}: TemplateVariableSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  const handleSelect = (variableValue: string) => {
    setSelectedVariable(variableValue);
    onSelectVariable(variableValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {compact ? (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="Insert Template Variable"
          >
            <Code2Icon className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Code2Icon className="h-3.5 w-3.5" />
            <span>Variables</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-72"
        align="start"
        sideOffset={sideOffset}
        side="bottom"
      >
        <Command>
          <CommandInput placeholder="Search template variables..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No template variables found.</CommandEmpty>
            {TEMPLATE_VARIABLES.map((category) => (
              <CommandGroup heading={category.category} key={category.category}>
                {category.items.map((variable) => (
                  <CommandItem
                    key={variable.id}
                    value={variable.id}
                    onSelect={() => handleSelect(variable.value)}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span>{variable.display}</span>
                      <p className="text-xs text-muted-foreground">
                        {variable.description}
                      </p>
                    </div>
                    {selectedVariable === variable.value && (
                      <CheckIcon className={cn("h-4 w-4 text-primary")} />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
