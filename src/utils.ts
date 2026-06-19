//prevent spam, only last time called
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timerId: number | undefined;

    return function (...args: Parameters<T>) {
        //cancel previous calling
        if (timerId) {
            clearTimeout(timerId);
        }

        // timerId = setTimeout(fn, delay); //ko truyền được args vào trong function
        timerId = setTimeout(() => fn(...args), delay);
        // timerId = setTimeout(() => {fn(...args)}, delay); //block body, nếu mun thêm chạy cùng fn thì hẵng dùng, ko thid dynfg cách expresion body bên trên cho gọn
    }
}