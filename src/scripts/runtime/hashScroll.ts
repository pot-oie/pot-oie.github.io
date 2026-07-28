const SEARCH_TEXT_HASH_PREFIX = "pf-text-";

type SearchTextHashPayload = {
  text: string;
  fallback?: string;
  candidates?: string[];
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}
function decodeSearchTextHash(
  hashValue: string,
): SearchTextHashPayload | null {
  if (!hashValue.startsWith(SEARCH_TEXT_HASH_PREFIX)) return null;

  const encoded = hashValue.slice(SEARCH_TEXT_HASH_PREFIX.length);

  try {
    const decoded = decodeBase64Url(encoded);
    const parsed = JSON.parse(decoded) as Partial<SearchTextHashPayload>;
    const text = String(parsed.text || "").replace(/\s+/g, " ").trim();
    const fallback = String(parsed.fallback || "")
      .replace(/\s+/g, " ")
      .trim();
    const candidates =
      Array.isArray(parsed.candidates)
        ? parsed.candidates
        : typeof parsed.candidates === "string"
          ? parsed.candidates.split("\u001f")
          : [];

    if (!text) return null;

    return {
      text,
      fallback,
      candidates: candidates
        .map((item) => String(item).replace(/\s+/g, " ").trim())
        .filter(Boolean),
    };
  } catch {
    try {
      const text = decodeBase64Url(encoded).replace(/\s+/g, " ").trim();
      return text ? { text } : null;
    } catch {
      return null;
    }
  }
}

function shouldIndexSearchTextNode(node: Text) {
  const parent = node.parentElement;

  if (!parent || !node.nodeValue?.trim()) return false;
  if (parent.closest("script, style, noscript, svg, canvas")) return false;
  if (parent.closest(".not-prose, [data-pagefind-ignore]")) return false;

  return true;
}

function buildSearchTextIndex(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldIndexSearchTextNode(node as Text)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const parts: string[] = [];
  const map: { node: Text; offset: number }[] = [];
  let current: Text | null = walker.nextNode() as Text | null;

  while (current) {
    const value = current.nodeValue || "";

    for (let offset = 0; offset < value.length; offset += 1) {
      const char = value[offset];

      if (/\s/.test(char)) {
        if (parts.length > 0 && parts[parts.length - 1] !== " ") {
          parts.push(" ");
          map.push({ node: current, offset });
        }
        continue;
      }

      parts.push(char.toLocaleLowerCase());
      map.push({ node: current, offset });
    }

    current = walker.nextNode() as Text | null;
  }

  return {
    text: parts.join("").trimEnd(),
    map,
  };
}

function findSearchTextRange(targetText: string, root: ParentNode) {
  const normalizedTarget = targetText
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();

  if (!root || !normalizedTarget) return null;

  const index = buildSearchTextIndex(root);
  const start = index.text.indexOf(normalizedTarget);

  if (start < 0) return null;

  const startPoint = index.map[start];
  const endPoint = index.map[start + normalizedTarget.length - 1];

  if (!startPoint || !endPoint) return null;

  const range = document.createRange();
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset + 1);

  return range;
}

function getSearchTextRoots(): ParentNode[] {
  const roots = Array.from(document.querySelectorAll(".prose-ink"));
  const main = document.querySelector("main");

  if (main) roots.push(main);
  roots.push(document.body);

  return [...new Set(roots)];
}

function findSearchTextRangeInPage(targets: string[]) {
  const normalizedTargets = [
    ...new Set(
      targets
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  ];

  for (const root of getSearchTextRoots()) {
    for (const target of normalizedTargets) {
      const range = findSearchTextRange(target, root);
      if (range) return range;
    }
  }

  return null;
}

function scrollToPageY(top: number) {
  const lenis = (window as any).lenis;

  if (lenis) {
    lenis.start?.();
    lenis.resize?.();
    lenis.scrollTo(top, {
      offset: -90,
      immediate: true,
      force: true,
    });
    return;
  }

  window.scrollTo({
    top: Math.max(0, top - 90),
    behavior: "auto",
  });
}

function scrollToSearchTextHash(hashValue: string) {
  const target = decodeSearchTextHash(hashValue);
  if (!target) return false;

  const range = findSearchTextRangeInPage([
    target.text,
    target.fallback || "",
    ...(target.candidates || []),
  ]);
  if (!range) return false;

  const rect = Array.from(range.getClientRects()).find(
    (item) => item.width > 0 || item.height > 0,
  );

  if (!rect) return false;

  scrollToPageY(window.scrollY + rect.top);

  return true;
}

export function scrollToLocationHash() {
  if (!location.hash) return;

  const id = decodeURIComponent(location.hash.slice(1));
  const attempts = [0, 80, 240, 520, 900];

  attempts.forEach((delay) => {
    window.setTimeout(() => {
      if (!location.hash) return;
      if (decodeURIComponent(location.hash.slice(1)) !== id) return;
      if (scrollToSearchTextHash(id)) return;

      const target = document.getElementById(id);
      if (target) {
        scrollToPageY(window.scrollY + target.getBoundingClientRect().top);
      }
    }, delay);
  });
}
