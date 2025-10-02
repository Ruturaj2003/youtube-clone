export const dynamic = "force-dynamic";
interface SearchPageProps {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { categoryId, query } = await searchParams;

  return (
    <div>
      Searching for {query} in {categoryId}
    </div>
  );
};

export default SearchPage;
