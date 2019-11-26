---
title: nextTick事件原理
---

::: tip
nextTick实现原理
:::

## 概述
<img :src="$withBase('/16ab1b0523456e8a.png')" alt="foo">

### Vue官方对nextTick这个API的描述
>  在下次DOM更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的DOM。

``` js
// 修改数据
vm.msg = 'Hello'
// DOM 还没有更新
Vue.nextTick(function () {
  // DOM 更新了
})

// 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
Vue.nextTick()
 .then(function () {
  // DOM 更新了
})

```





> 2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。

> 可能你还没有注意到，Vue 异步执行 DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。Vue 在内部尝试对异步队列使用原生的 Promise.then 和 MessageChannel，如果执行环境不支持，会采用 setTimeout(fn, 0) 代替。

> 例如，当你设置 vm.someData = 'new value' ，该组件不会立即重新渲染。当刷新队列时，组件会在事件循环队列清空时的下一个“tick”更新。多数情况我们不需要关心这个过程，但是如果你想在 DOM 状态更新后做点什么，这就可能会有些棘手。虽然 Vue.js 通常鼓励开发人员沿着“数据驱动”的方式思考，避免直接接触 DOM，但是有时我们确实要这么做。为了在数据变化之后等待 Vue 完成更新 DOM ，可以在数据变化之后立即使用 Vue.nextTick(callback) 。这样回调函数在 DOM 更新完成后就会调用。

Vue对于这个API的感情是曲折的，在2.4版本、2.5版本和2.6版本中对于nextTick进行反复变动，原因是浏览器对于微任务的不兼容性影响、微任务和宏任务各自优缺点的权衡。

#### 上图解释
看以上流程图，如果Vue使用setTimeout等**宏任务**函数，那么势必要等待UI渲染完成后的下一个**宏任务**内执行，而如果Vue使用**微任务**,无需等待UI渲染完成才进行<mark>nextTick</mark>的回调函数操作，可以想象在JS引擎线程和GUI渲染线程之间来回切换，以及等待GUI渲染线程的过程中，浏览器势必要消耗性能，这是一个严谨的框架完全需要考虑的事情。
<br />
当然这里所说的只有<mark>nextTick</mark>执行用户回调之后的性能情况考虑，这中间当权不能忽略<mark>flushBatcherQueue</mark>更新Dom的操作，使用异步函数的另外一个作用当然是要确保同步代码执行完毕Dom更新性能优化

## 详细着说
### Vue方面
``` html
<template>
  <div>
    <div>{{number}}</div>
    <div @click="handleClick">click</div>
  </div>
</template>
```

``` js
 export default {
    data () {
        return {
            number: 0
        };
    },
    methods: {
        handleClick () {
            for(let i = 0; i < 10000; i++) {
                this.number++;
            }
        }
    }
}

```

在点击click事件之后，number会被遍历增加10000次。在Vue.js响应式系统中，可以看一下[Vue.js的响应式系统原理](https://juejin.im/post/5b82b174518825431079d473)。我们知道Vue.js会经历“setter->Dep->Watcher->patch->视图”这几个流程
<br/>

根据以往的理解，每次number被+1的时候，都会触发number的setter按照上边的流程最后来修改真实的DOM,然后DOM被更新了10000次，想想都刺激！看一下官网的描述：**Vue 异步执行 DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要显然。**

Vue.js在修改数据的时候，不会立马修改数据，而是要等同一事件轮询的数据都更新完之后，再统一进行视图更新。
``` js
 //改变数据
vm.message = 'changed'

//想要立即使用更新后的DOM。这样不行，因为设置message后DOM还没有更新
console.log(vm.$el.textContent) // 并不会得到'changed'

//这样可以，nextTick里面的代码会在DOM更新后执行
Vue.nextTick(function(){
    console.log(vm.$el.textContent) //可以得到'changed'
})

```
###### 图解
<img :src="$withBase('/165821ca4d06f6c1.png')" alt="foo">

## 浏览器
浏览器（多进程）包含了**Browser进程**（浏览器的主进程）、**第三方插件进程**和**GPU进程**（浏览器渲染进程），其中**GPU进程**（多线程）和Web前端密切相关，包含以下线程：

* GUI渲染线程
* JS引擎线程
* 事件触发线程（和EventLoop密切相关）
* 定时触发器线程
* 异步HTTP请求线程

> GUI渲染线程和JS引擎线程是互斥的，为了防止DOM渲染的不一致性，其中一个线程执行时另一个线程会被挂起。

::: 注意
这些线程中，和Vue的nextTick息息相关的是JS引擎线程和事件触发线程。
:::

### JS引擎线程和事件触发线程

浏览器页面初次渲染完毕后，JS引擎线程结合事件触发线程的工作流程如下：
1. 同步任务在JS引擎线程（主线程）上执行，形成执行栈（Execution Context Stack）。
2. 主线程之外，事件触发线程管理着一个任务队列（Task Queue）。只要异步任务有了运行结果，就在任务队列之中放置一个事件。
3. 执行栈中的同步任务执行完毕，系统就会读取任务队列，如果有异步任务需要执行，将其加到主线程的执行栈并执行相应的异步任务。

<img :src="$withBase('/16ab1b052294607c.png')" alt="foo">

### 事件循环机制（Event Loop）
事件触发线程管理的任务队列是如何产生的呢？事实上这些任务就是从JS引擎线程本身产生的，主线程在运行时会产生执行栈，栈中的代码调用某些异步API时会在任务队列中添加事件，栈中的代码执行完毕后，就会读取任务队列中的事件，去执行事件对应的回调函数，如此循环往复，形成事件循环机制，如下图所示：
<img :src="$withBase('/16ab1b0b9c0cbfa4.png')" alt="foo">

### 任务类型
JS中有两种任务类型：**微任务**（microtask）和**宏任务**（macrotask），在ES6中，microtask称为 jobs，macrotask称为 task。
<br />

**宏任务**： script （主代码块）、<mark>setTimeout</mark> 、<mark>setInterval</mark> 、<mark>setImmediate</mark> 、I/O 、UI rendering

**微任务**：process.nextTick（Nodejs） 、promise 、Object.observe 、MutationObserver

> 这里要重点说明一下，宏任务并非全是异步任务，主代码块就是属于宏任务的一种（Promises/A+规范）。

它们之间区别如下:
* 宏任务是每次执行栈执行的代码（包括每次从事件队列中获取一个事件回调并放到执行栈中执行）
* 浏览器为了能够使得JS引擎线程与GUI渲染线程有序切换，会在当前宏任务结束之后，下一个宏任务执行开始之前，对页面进行重新渲染（宏任务 > 渲染 > 宏任务 > ...）

* 微任务是在当前宏任务执行结束之后立即执行的任务（在当前 宏任务执行之后，UI渲染之前执行的任务）。微任务的响应速度相比setTimeout（下一个宏任务）会更快，因为无需等待UI渲染。

* 当前宏任务执行后，会将在它执行期间产生的所有微任务都执行一遍。

根据事件循环机制，重新梳理一下流程：

* 执行一个宏任务（首次执行的主代码块或者任务队列中的回调函数）
* 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中
* 宏任务执行完毕后，立即执行当前微任务队列中的所有任务（依次执行）
* JS引擎线程挂起，GUI线程执行渲染
* GUI线程渲染完毕后挂起，JS引擎线程执行任务队列中的下一个宏任务


## 参考
[https://juejin.im/post/5cd9854b5188252035420a13](https://juejin.im/post/5cd9854b5188252035420a13)
[https://juejin.im/post/5b85b3326fb9a019fc76ecee](https://juejin.im/post/5b85b3326fb9a019fc76ecee)
[https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)



