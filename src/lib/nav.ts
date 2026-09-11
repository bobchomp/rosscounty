export type NavLink = {
  label: string;
  href: string;
};

// Primary public site navigation. Shop is a route handler that redirects
// out to the club's Shopify store rather than a page of its own.
export const siteNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Tickets", href: "/tickets" },
  { label: "Fixtures & Table", href: "/fixtures" },
  { label: "Shop", href: "/shop" },
  { label: "News", href: "/news" },
  { label: "Club", href: "/club" },
  { label: "Commercial", href: "/commercial" },
  { label: "Squads", href: "/squads" },
  { label: "Hospitality", href: "/hospitality" },
];

export const adminNav: NavLink[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "News", href: "/admin/news" },
  { label: "Fixtures & Results", href: "/admin/fixtures" },
  { label: "Squads", href: "/admin/squads" },
  { label: "Tickets", href: "/admin/tickets" },
  { label: "Club Pages", href: "/admin/club" },
  { label: "Commercial", href: "/admin/commercial" },
  { label: "Hospitality", href: "/admin/hospitality" },
  { label: "Settings", href: "/admin/settings" },
];
