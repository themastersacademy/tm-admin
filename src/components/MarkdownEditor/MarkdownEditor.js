"use client";
import React from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import katex from "katex";
import { getCodeString } from "rehype-rewrite";
import "katex/dist/katex.css";
import { InsertPhoto } from "@mui/icons-material";
import { apiFetch } from "@/src/lib/apiFetch";

const rehypePlugins = [rehypeSanitize];

export default function MarkdownEditor({ value, onChange }) {
  const customCommands = [
    commands.bold,
    commands.italic,
    {
      name: "underline",
      keyCommand: "underline",
      buttonProps: { "aria-label": "Underline" },
      icon: <u>U</u>,
      execute: (state, api) => {
        api.replaceSelection(`<u>${state.selectedText}</u>`);
      },
    },
    commands.strikethrough,
    commands.code,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.table,
    commands.help,
    {
      name: "image",
      keyCommand: "image",
      buttonProps: { "aria-label": "Insert image" },
      icon: <InsertPhoto sx={{ fontSize: "16px" }} />,
      execute: async (state, api) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) {
            alert("No file selected!");
            return;
          }

          try {
            const response = await apiFetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/questions/upload-image`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filename: file.name,
                  fileType: file.type,
                }),
              }
            );

            const { signedUrl, imgUrl } = response.data;
            await fetch(signedUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });

            const markdownImage = `![Uploaded Image](${imgUrl})\n`;
            api.replaceSelection(markdownImage);
            console.log(markdownImage);
          } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed!");
          }
        };
        input.click();
      },
    },
  ];

  return (
    <div
      className="container"
      style={{ position: "relative", width: "560px", height: "400px" }}
      data-color-mode="light"
    >
      <MDEditor
        value={value}
        onChange={onChange}
        commands={customCommands}
        style={{
          // width: "560px",
          minHeight: "400px",
        }}
        previewOptions={{
          components: {
            code: ({ children = [], className, ...props }) => {
              if (
                typeof children === "string" &&
                /^\$\$(.*)\$\$/.test(children)
              ) {
                const html = katex.renderToString(
                  children.replace(/^\$\$(.*)\$\$/, "$1"),
                  {
                    throwOnError: false,
                  }
                );
                return (
                  <code
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={{ background: "transparent" }}
                  />
                );
              }
              const code =
                props.node && props.node.children
                  ? getCodeString(props.node.children)
                  : children;
              if (
                typeof code === "string" &&
                typeof className === "string" &&
                /^language-katex/.test(className.toLocaleLowerCase())
              ) {
                const html = katex.renderToString(code, {
                  throwOnError: false,
                });
                return (
                  <code
                    style={{ fontSize: "150%" }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              }
              return <code className={String(className)}>{children}</code>;
            },
          },
        }}
      />
    </div>
  );
}
