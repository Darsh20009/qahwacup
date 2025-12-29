import { useToast } from "@/hooks/use-toast"
import { useAudio } from "@/hooks/use-audio"
import { useEffect } from "react"
import {
 Toast,
 ToastClose,
 ToastDescription,
 ToastProvider,
 ToastTitle,
 ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
 const { toasts } = useToast()
 const { playSound } = useAudio()

 useEffect(() => {
   if (toasts.length > 0) {
     const lastToast = toasts[toasts.length - 1];
     const title = lastToast.title?.toString().toLowerCase() || "";
     const description = lastToast.description?.toString().toLowerCase() || "";
     
     if (title.includes('order') || description.includes('order') || title.includes('طلب')) {
       playSound('new_order');
     } else {
       playSound('notification');
     }
   }
 }, [toasts, playSound]);

 return (
 <ToastProvider>
 {toasts.map(function ({ id, title, description, action, ...props }) {
 return (
 <Toast key={id} {...props}>
 <div className="grid gap-1">
 {title && <ToastTitle>{title}</ToastTitle>}
 {description && (
 <ToastDescription>{description}</ToastDescription>
 )}
 </div>
 {action}
 <ToastClose />
 </Toast>
 )
 })}
 <ToastViewport />
 </ToastProvider>
 )
}
