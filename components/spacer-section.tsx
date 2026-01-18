export function SpacerSection() {
    return (
        <section className="relative min-h-screen w-full border-t border-border">
            {/* Empty spacer section with 100vh */}

            {/* Bottom divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
