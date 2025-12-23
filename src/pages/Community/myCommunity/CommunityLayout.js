import { NavLink, Outlet, useParams } from "react-router-dom";
import "./CommunityLayout.css";
import PageHeader from "../../../component/PageHeader";

const CommunityLayout = () => {
    const { communityId } = useParams();

    return (
        <section className="CommunityLayout">
            <PageHeader />
            <header className="communityLayoutHeader">
                <h1 className="communityLayoutTitle">Community</h1>
            </header>

            <nav className="communityLayoutTabs">
                <NavLink
                    end
                    to={`/community/${communityId}`}
                    className={({ isActive }) =>
                        isActive ? "tabLink active" : "tabLink"
                    }
                >
                    Overview
                </NavLink>
                <NavLink
                    to={`/community/${communityId}/my-posts`}
                    className={({ isActive }) =>
                        isActive ? "tabLink active" : "tabLink"
                    }
                >
                    My Posts
                </NavLink>
            </nav>

            <main className="communityLayoutBody">
                <Outlet />
            </main>
        </section>
    );
};

export default CommunityLayout;
