const PostDetailShell = ({ heroStyle, PageHeader, Footer, children }) => {
  return (
    <section className="ForumContainer">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />
      </div>
      {children}
      <Footer />
    </section>
  );
};

export default PostDetailShell;
