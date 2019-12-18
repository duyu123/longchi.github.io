---
title: Bem 规范
---
::: tip
Bem 规范
:::


<img :src="$withBase('/css/bem1.png')" alt="bem">

BEM的意思就是块（block）、元素（element）、修饰符（modifier）,是由Yandex团队提出的一种前端命名方法论。这种巧妙的命名方法让你的CSS类对其他开发者来说更加透明而且更有意义。BEM命名约定更加严格，而且包含更多的信息，它们用于一个团队开发一个耗时的大项目。

命名约定的模式如下：
``` css
.block{}
.block__element{}
.block--modifier{}
```
* <mark>.block</mark> 代表了更高级别的抽象或组件。
* <mark>.block__element</mark> 代表.block的后代，用于形成一个完整的.block的整体。
* <mark>.block--modifier</mark> 代表.block的不同状态或不同版本。

- eg:

``` css
.site-search{} /* 块 */
.site-search__field{} /* 元素 */
.site-search--full{} /* 修饰符 */
```
BEM的关键是光凭名字就可以告诉其他开发者某个标记是用来干什么的。通过浏览HTML代码中的class属性，你就能够明白模块之间是如何关联的：有一些仅仅是组件，有一些则是这些组件的子孙或者是元素,还有一些是组件的其他形态或者是修饰符。我们用一个类比/模型来思考一下下面的这些元素是怎么关联的：

``` css
.person{}
.person__hand{}
.person--female{}
.person--female__hand{}
.person__hand--left{}
```

``` html
<form class="site-search  site-search--full">
  <input type="text" class="site-search__field">
  <input type="Submit" value ="Search" class="site-search__button">
</form>
```

我们能清晰地看到有个叫.site-search的块，他内部是一个叫.site-search__field的元素。并且.site-search还有另外一种形态叫.site-search--full。<br />

### Vant UI 如何使用bem


#### Button 组件调用如下

``` js
const [createComponent, bem] =  ('button');


const classes = [
  bem([
    type,
    props.size,
    {
      plain,
      disabled,
      hairline,
      block: props.block,
      round: props.round,
      square: props.square
    }
  ]),
  { [BORDER_SURROUND]: hairline }
];


content.push(
  <Loading
    class={bem('loading')}
    size={props.loadingSize}
    type={props.loadingType}
    color="currentColor"
  />
);

```

#### createNamespace 和bem 如何封装

``` js
export function createNamespace(name: string): CreateNamespaceReturn {
  name = 'van-' + name;
  return [createComponent(name), createBEM(name), createI18N(name)];
}
```

``` js
/**
 * bem helper
 * b() // 'button'
 * b('text') // 'button__text'
 * b({ disabled }) // 'button button--disabled'
 * b('text', { disabled }) // 'button__text button__text--disabled'
 * b(['disabled', 'primary']) // 'button button--disabled button--primary'
 */

export type Mod = string | { [key: string]: any };
export type Mods = Mod | Mod[];

const ELEMENT = '__';
const MODS = '--';

function join(name: string, el?: string, symbol?: string): string {
  return el ? name + symbol + el : name;
}

function prefix(name: string, mods: Mods): Mods {
  if (typeof mods === 'string') {
    return join(name, mods, MODS);
  }

  if (Array.isArray(mods)) {
    return mods.map(item => <Mod>prefix(name, item));
  }

  const ret: Mods = {};
  if (mods) {
    Object.keys(mods).forEach(key => {
      ret[name + MODS + key] = mods[key];
    });
  }

  return ret;
}

export function createBEM(name: string) {
  return function(el?: Mods, mods?: Mods): Mods {
    if (el && typeof el !== 'string') {
      mods = el;
      el = '';
    }
    el = join(name, el, ELEMENT);

    return mods ? [el, prefix(el, mods)] : el;
  };
}

export type BEM = ReturnType<typeof createBEM>;

```


参考链接:
[yandex](https://yandex.com/)
[https://mono.company/frontend/learning-to-love-bem/](https://mono.company/frontend/learning-to-love-bem/)
[https://en.bem.info/methodology/quick-start/](https://en.bem.info/methodology/quick-start/)
[https://segmentfault.com/a/1190000014687099](https://segmentfault.com/a/1190000014687099)