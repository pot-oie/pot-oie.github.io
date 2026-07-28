// 辅助函数：从图标模板中提取对应的 SVG HTML
function getIconSvg(iconName: string) {
  const template = document.getElementById(
    "code-icon-template",
  ) as HTMLTemplateElement;
  if (!template) return "";
  const iconWrapper = template.content.querySelector(
    `[data-icon="${iconName}"]`,
  );
  return iconWrapper ? iconWrapper.innerHTML : "";
}

// 代码块功能初始化：处理复制、收缩、主题切换等交互
export function initTechnicalCodeBlocks() {
  const allCodeBlocks = document.querySelectorAll("pre.astro-code");
  const inkTemplate = document.getElementById(
    "ink-action-template",
  ) as HTMLTemplateElement;

  allCodeBlocks.forEach((block) => {
    const pre = block as HTMLElement;

    // 1. 构建独立的 Wrapper：承载印章和绝对定位逻辑
    if (pre.parentElement?.classList.contains("code-block-wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.className =
      "code-block-wrapper relative mt-12 mb-8 w-full z-10 style-ink";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const lang =
      pre.getAttribute("lang") || pre.getAttribute("data-language");
    if (lang) pre.dataset.language = lang;

    const codeElement = pre.querySelector("code");
    if (!codeElement || !(codeElement instanceof HTMLElement)) return;

    // 【代码块滚动锁定】防止从代码块穿透到页面滚动
    codeElement.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        const delta = e.deltaY;
        const { scrollTop, scrollHeight, clientHeight } = codeElement;
        const tolerance = 1;
        const isAtTop = scrollTop <= 0;
        const isAtBottom =
          scrollTop + clientHeight >= scrollHeight - tolerance;
        if ((delta < 0 && isAtTop) || (delta > 0 && isAtBottom)) {
          e.preventDefault();
        }
        e.stopPropagation();
      },
      { passive: false },
    );

    pre.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        if (e.target === pre) {
          e.preventDefault();
          codeElement.scrollTop += e.deltaY;
        }
      },
      { passive: false },
    );

    // 2. 挂载 macOS 风格的 UI 按钮
    const macCopyBtn = document.createElement("button");
    macCopyBtn.className = "mac-action-base mac-action-btn mac-copy-btn";
    macCopyBtn.innerHTML = getIconSvg("mac-copy");

    const macSuccessMsg = document.createElement("span");
    macSuccessMsg.className = "mac-action-base mac-copy-success";
    macSuccessMsg.innerHTML = getIconSvg("mac-success");

    const macThemeBtn = document.createElement("button");
    macThemeBtn.className = "mac-action-base mac-action-btn mac-theme-btn";
    macThemeBtn.innerHTML = getIconSvg("mac-theme");
    macThemeBtn.title = "切换至水墨风";

    // 判断代码块是否需要折叠功能（超过 12 行则支持折叠）
    let macToggleBtn = null;
    const isCollapsible = codeElement.querySelectorAll(".line").length > 12;

    if (isCollapsible) {
      pre.classList.add("collapsed");
      macToggleBtn = document.createElement("button");
      macToggleBtn.className =
        "mac-action-base mac-action-btn mac-toggle-btn";
      macToggleBtn.innerHTML = getIconSvg("mac-expand");
      pre.appendChild(macToggleBtn);
    }

    pre.appendChild(macThemeBtn);
    pre.appendChild(macSuccessMsg);
    pre.appendChild(macCopyBtn);

    // 3. 挂载水墨风的 UI 操作栏
    let inkCopyBtn: HTMLButtonElement | null = null;
    let inkSuccessMsg: HTMLElement | null = null;
    let inkToggleBtn: HTMLButtonElement | null = null;
    let inkThemeBtn: HTMLButtonElement | null = null;

    if (inkTemplate) {
      const inkActionsNode = inkTemplate.content.cloneNode(
        true,
      ) as DocumentFragment;
      const inkContainer = inkActionsNode.querySelector(
        ".ink-actions-container",
      ) as HTMLElement;

      inkCopyBtn = inkContainer.querySelector(
        ".ink-copy-btn",
      ) as HTMLButtonElement;
      inkCopyBtn.innerHTML = getIconSvg("ink-copy");
      inkSuccessMsg = inkContainer.querySelector(
        ".ink-copy-success",
      ) as HTMLElement;

      inkThemeBtn = inkContainer.querySelector(
        ".ink-theme-btn",
      ) as HTMLButtonElement;
      inkThemeBtn.innerHTML = getIconSvg("ink-theme");

      inkToggleBtn = inkContainer.querySelector(
        ".ink-toggle-btn",
      ) as HTMLButtonElement;
      if (isCollapsible) {
        inkToggleBtn.innerHTML = getIconSvg("ink-expand");
      } else {
        inkToggleBtn.style.display = "none";
      }

      wrapper.appendChild(inkContainer);

      // 移动端点击印章展开卷轴逻辑
      const inkSealTrigger = inkContainer.querySelector(".ink-seal-trigger");
      if (inkSealTrigger) {
        inkSealTrigger.addEventListener("click", () => {
          if (window.innerWidth < 768) {
            inkContainer.classList.toggle("is-open");
          }
        });
      }
    }

    // 4. 绑定通用交互逻辑

    // --- 【复制代码功能】 ---
    const handleCopy = (isInk: boolean) => {
      const allLines = codeElement.querySelectorAll(".line");
      let codeToCopy =
        allLines.length > 0
          ? Array.from(allLines)
              .map((line) => line.textContent || "")
              .join("\n")
          : codeElement.innerText || "";

      navigator.clipboard.writeText(codeToCopy).then(() => {
        if (isInk && inkCopyBtn && inkSuccessMsg) {
          // 水墨风：使用 Flex 布局的显隐替换
          inkCopyBtn.style.display = "none";
          inkSuccessMsg.classList.remove("hidden");
          inkSuccessMsg.classList.add("flex");
          inkSuccessMsg.innerHTML = getIconSvg("ink-success");
          setTimeout(() => {
            inkSuccessMsg.classList.add("hidden");
            inkSuccessMsg.classList.remove("flex");
            inkCopyBtn.style.display = "flex";
          }, 2000);
        } else {
          // macOS：使用 display 与 opacity 结合的动画
          macCopyBtn.style.display = "none";
          macSuccessMsg.classList.add("show");
          setTimeout(() => {
            macSuccessMsg.classList.remove("show");
            macCopyBtn.style.display = "flex";
          }, 2000);
        }
      });
    };

    macCopyBtn.addEventListener("click", () => handleCopy(false));
    if (inkCopyBtn) {
      inkCopyBtn.addEventListener("click", () => handleCopy(true));
    }

    // --- 【代码块折叠/展开功能】 ---
    if (isCollapsible && macToggleBtn) {
      const handleToggle = () => {
        const isCollapsed = pre.classList.toggle("collapsed");
        macToggleBtn.innerHTML = getIconSvg(
          isCollapsed ? "mac-expand" : "mac-collapse",
        );
        if (inkToggleBtn)
          inkToggleBtn.innerHTML = getIconSvg(
            isCollapsed ? "ink-expand" : "ink-collapse",
          );
        if (isCollapsed)
          pre.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      macToggleBtn.addEventListener("click", handleToggle);
      if (inkToggleBtn) inkToggleBtn.addEventListener("click", handleToggle);
    }

    // --- 【风格切换功能：macOS 风格 ↔ 水墨风】 ---
    const handleThemeToggle = () => {
      wrapper.classList.toggle("style-ink");
    };
    macThemeBtn.addEventListener("click", handleThemeToggle);
    if (inkThemeBtn) inkThemeBtn.addEventListener("click", handleThemeToggle);
  });
}
