export default function ProductSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            <div className="aspect-square bg-charcoal-100" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-charcoal-100 rounded w-1/3" />
                <div className="h-5 bg-charcoal-100 rounded w-3/4" />
                <div className="h-3 bg-charcoal-100 rounded w-1/2" />
                <div className="h-6 bg-charcoal-100 rounded w-1/3" />
                <div className="h-10 bg-charcoal-100 rounded-xl w-full" />
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="h-[500px] bg-charcoal-100 rounded-3xl animate-pulse" />
    );
}

export function StatSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="h-4 bg-charcoal-100 rounded w-1/2 mb-3" />
            <div className="h-8 bg-charcoal-100 rounded w-2/3" />
        </div>
    );
}
