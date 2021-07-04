# 快速笔记 Markdown 扩展语法指北

除了常见的 Markdown 语法之外，为了方便以更丰富的形式记录笔记，快速笔记还支持以下的 Markdown 扩展语法：

## 高亮

```markdown
敏捷的==棕色狐狸==跨过==懒狗==。
```

敏捷的==棕色狐狸==跨过==懒狗==。

## 上下标

上下标也可被用于邮件编辑器中。

```markdown
根据摸森堡测不准原理 ^[1]^，摸鱼动作和~（摸鱼）~主体无法被同时观测到。
```

根据摸森堡测不准原理 ^[1]^，摸鱼动作和~（摸鱼）~主体无法被同时观测到。

## Checklist

```markdown
- [ ] 这件事未完成
- [ ] 这件事也未完成
- [x] 这件事完成了
```

- [ ] 这件事未完成
- [ ] 这件事也未完成
- [x] 这件事完成了

## 提示

提示也可被用于邮件编辑器中。

共有四种提示 `success`、`info`、`warning` 和 `error`。

```markdown
::: success
这是个成功的提示。
:::

::: info
这是个信息提示。剩下两个都一样咱就不整了。
:::
```

::: success
这是个成功的提示。
:::

::: info
这是个信息提示。剩下两个都一样咱就不整了。
:::

## 样式标记

除 `黑幕` 与 `模糊` 外，其他样式标记均可被用于邮件编辑器中。

```markdown
[任意内容]{样式名称}
```

| 可选样式 |  预览 |
| :-----| :---- |
| `这是[红色]{red}` | 这是[红色]{red} |
| `这是[橙色]{orange}` | 这是[橙色]{orange} |
| `这是[黄色]{yellow}` | 这是[黄色]{yellow} |
| `这是[绿色]{green}` | 这是[绿色]{green} |
| `这是[青色]{teal}` | 这是[青色]{teal} |
| `这是[蓝色]{blue}` | 这是[蓝色]{blue} |
| `这是[紫色]{purple}` | 这是[紫色]{purple} |
| `这是[灰色]{grey}` | 这是[灰色]{grey} |
| `[红色]{bg-red}背景` | [红色]{bg-red}背景 |
| `[橙色]{bg-orange}背景` | [橙色]{bg-orange}背景 |
| `[黄色]{bg-yellow}背景` | [黄色]{bg-yellow}背景 |
| `[绿色]{bg-green}背景` | [绿色]{bg-green}背景 |
| `[青色]{bg-teal}背景` | [青色]{bg-teal}背景 |
| `[蓝色]{bg-blue}背景` | [蓝色]{bg-blue}背景 |
| `[紫色]{bg-purple}背景` | [紫色]{bg-purple}背景 |
| `[灰色]{bg-grey}背景` | [灰色]{bg-grey}背景 |
| `这个字[比较大]{big}` | 这个字[比较大]{big} |
| `这个字[比较小]{small}` | 这个字[比较小]{small} |
| `这里有[黑幕]{mask}` | 这里有[黑幕]{mask} |
| `[模糊]{blur}的内容` | [模糊]{blur}的内容 |

此外，你还可以通过开放的 `style` 属性写一些内联 CSS 样式：

```markdown
这段文本使用了[自定义 CSS 样式]{style="display: inline-block; padding: 2px 5px; margin: 0 2px; border-radius: 3px; background: grey; color: white"}。
```

这段文本使用了[自定义 CSS 样式]{style="display: inline-block; padding: 2px 5px; margin: 0 2px; border-radius: 3px; background: grey; color: white"}。

## 增强的表格

增强的表格也可被用于邮件编辑器中。

```markdown
|            | 跨列表头            ||
| 多行        | 表头     | 也可以    |
| ---------- | :------: | -------- |
| 跨行单元格   | 跨列单元格          ||
| ^^         | N/A      | N/A      |
| 多行也可以   | - Item 1 | - Item 1 | \
|            | - Item 2 | - Item 2 |
[表格标题]
```

|            | 跨列表头            ||
| 多行        | 表头     | 也可以    |
| ---------- | :------: | -------- |
| 跨行单元格   | 跨列单元格          ||
| ^^         | N/A      | N/A      |
| 多行也可以   | - Item 1 | - Item 1 | \
|            | - Item 2 | - Item 2 |
[表格标题]

更多语法规则请参考 [MultiMarkdown 表格](https://github.com/redbug312/markdown-it-multimd-table/blob/master/README.md)。
