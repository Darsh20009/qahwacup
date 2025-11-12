import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer, LoyaltyCard } from "@/types";

interface SearchCustomerProps {
  setSearchPhone: (phone: string) => void;
}

const SearchCustomer: React.FC<SearchCustomerProps> = ({ setSearchPhone }) => {
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const { data: loyaltyCard, isLoading: isLoadingCard, error: cardError } = useQuery<LoyaltyCard>({
    queryKey: [`/api/loyalty/cards/phone/${searchPhone}`],
    enabled: !!searchPhone && searchPhone.length === 9,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: false,
  });

  const handleSearch = () => {
    const cleanPhone = phoneNumber.trim().replace(/\s/g, '');

    if (cleanPhone.length !== 9) {
      toast({
        variant: "destructive",
        title: "رقم هاتف غير صحيح",
        description: "يرجى إدخال رقم هاتف مكون من 9 أرقام",
      });
      return;
    }

    if (!cleanPhone.startsWith('5')) {
      toast({
        variant: "destructive",
        title: "رقم هاتف غير صحيح",
        description: "يجب أن يبدأ رقم الهاتف بالرقم 5",
      });
      return;
    }

    if (!/^5\d{8}$/.test(cleanPhone)) {
      toast({
        variant: "destructive",
        title: "رقم هاتف غير صحيح",
        description: "صيغة رقم الهاتف غير صحيحة (مثال: 512345678)",
      });
      return;
    }

    setSearchPhone(cleanPhone);
  };

  return (
    <div className="flex items-center gap-4">
      <Input
        type="tel"
        placeholder="أدخل رقم الهاتف (5xxxxxxxx)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        className="bg-[#1a1410] border-amber-500/30 text-white pr-10 text-right"
        dir="ltr"
        data-testid="input-phone"
        maxLength={9}
      />
      <Button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-black">
        بحث
      </Button>
    </div>
  );
};

export default SearchCustomer;