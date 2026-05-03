// lib/github.ts
export async function getRepoStars() {
  const res = await fetch(
    "https://api.github.com/repos/peyush-nuwal/Fluxo.io",
    {
      next: { revalidate: 3600 }, // cache for 1 hour
    },
  );

  if (!res.ok) return 0;

  const data = await res.json();
  return data.stargazers_count;
}
