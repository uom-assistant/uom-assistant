# Quick Notes Extended Markdown Syntax Guide

For the convenience of taking notes in a richer form, Quick Notes also support the following extended Markdown syntax in addition to the common ones:

## Highlight

```markdown
The quick ==brown fox== jumps over the ==lazy dog==.
```

The quick ==brown fox== jumps over the ==lazy dog==.

## Subscript and Superscript

Subscript and superscript can also be used in the email editor.

```markdown
This is a line of text used to demonstrate ~subscript~ and ^superscript^.
```

This is a line of text used to demonstrate ~subscript~ and ^superscript^.

## Checklist

```markdown
- [ ] This task is incomplete
- [ ] This task is also incomplete
- [x] This task has been completed
```

- [ ] This task is incomplete
- [ ] This task is also incomplete
- [x] This task has been completed

## Notification

Notification can also be used in the email editor.

There are four notifications: `success`, `info`, `warning` and `error`.

```markdown
::: success
This is a success message.
:::

::: info
This is an info message. Likewise for the last two.
:::
```

::: success
This is a success message.
:::

::: info
This is an info message. Likewise for the last two.
:::

## Style Tags

Style tags can be used in the email editor, with the exception of `mask` and `blur`.

```markdown
[content]{style}
```

| Available Style |  Preview |
| :-----| :---- |
| `This is [red]{red}` | This is [red]{red} |
| `This is [orange]{orange}` | This is [orange]{orange} |
| `This is [yellow]{yellow}` | This is [yellow]{yellow} |
| `This is [green]{green}` | This is [green]{green} |
| `This is [teal]{teal}` | This is [teal]{teal} |
| `This is [blue]{blue}` | This is [blue]{blue} |
| `This is [purple]{purple}` | This is [purple]{purple} |
| `This is [grey]{grey}` | This is [grey]{grey} |
| `[red]{bg-red} background` | [red]{bg-red} background |
| `[orange]{bg-orange} background` | [orange]{bg-orange} background |
| `[yellow]{bg-yellow} background` | [yellow]{bg-yellow} background |
| `[green]{bg-green} background` | [green]{bg-green} background |
| `[teal]{bg-teal} background` | [teal]{bg-teal} background |
| `[blue]{bg-blue} background` | [blue]{bg-blue} background |
| `[purple]{bg-purple} background` | [purple]{bg-purple} background |
| `[grey]{bg-grey} background` | [grey]{bg-grey} background |
| `This word is quite [big]{big}` | This word is quite [big]{big} |
| `This word is quite [small]{small}` | This word is quite [small]{small} |
| `Here is a [mask]{mask}` | Here is a [mask]{mask} |
| `[Blurred]{blur} content` | [Blurred]{blur} content |

Additionally, you can also write some inline CSS styles through the open `style` attribute:

```markdown
This text uses [custom CSS style]{style="display: inline-block; padding: 2px 5px; margin: 0 2px; border-radius: 3px; background: grey; color: white"}.
```

This text uses [custom CSS style]{style="display: inline-block; padding: 2px 5px; margin: 0 2px; border-radius: 3px; background: grey; color: white"}.

## Enhanced Table

Enhanced table can also be used in the email editor.

```markdown
|                  | Multi-column header ||
| Multiple rows of | header is | also possible |
| ---------------- | :-------: | -------- |
| Vertically merged cell | Horizontally merged cell ||
| ^^               | N/A       | N/A      |
| Multiline        | - Item 1  | - Item 1 | \
|                  | - Item 2  | - Item 2 |
[Table Title]
```

|                  | Multi-column header ||
| Multiple rows of | header is | also possible |
| ---------------- | :-------: | -------- |
| Vertically merged cell | Horizontally merged cell ||
| ^^               | N/A       | N/A      |
| Multiline        | - Item 1  | - Item 1 | \
|                  | - Item 2  | - Item 2 |
[Table Title]

For more syntax rules, please refer to [MultiMarkdown table](https://github.com/redbug312/markdown-it-multimd-table/blob/master/README.md).
