import { useEffect, useRef } from "react";
import "./PageHeader.css";
import PageLogo from "./PageLogo";
import MenuOptions from "./MenuOptions";

const PageHeader = () => {
    const toggleRef = useRef(null);

    const closeMenu = () => {
        if (toggleRef.current) toggleRef.current.checked = false;
    };

    useEffect(() => {
        const el = toggleRef.current;
        const onChange = () => {
            const open = !!el?.checked;
            document.documentElement.style.overflow = open ? "hidden" : "";
        };

        el?.addEventListener("change", onChange);
        return () => {
            document.documentElement.style.overflow = "";
            el?.removeEventListener("change", onChange);
        };
    }, []);

    const isExpanded = !!toggleRef.current?.checked;

    return (
        <header className='PageHeader'>
            <PageLogo />

            <nav className="MenuInline" aria-label="Primary">
                <MenuOptions page={false} />
            </nav>

            <input
                type="checkbox"
                id="page-menu-toggle"
                className="menu-toggle"
                ref={toggleRef}
                aria-label="Toggle navigation menu"
            />

            <label
                htmlFor="page-menu-toggle"
                className="Hamburger"
                aria-controls="page-top-sheet"
                aria-expanded={isExpanded}
            >
                <span></span><span></span><span></span>
            </label>

            <nav className="MenuPanel SideSheet" id="page-top-sheet" aria-label="Primary">
                <MenuOptions page={false} onNavigate={closeMenu} />
            </nav>

            <label htmlFor="page-menu-toggle" className="MenuBackdrop" aria-hidden="true" />
        </header>
    );
};

export default PageHeader;
