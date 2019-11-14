module.exports = {
  base: '/serina/',
  title: 'blog-demo',
  description: 'Vuepress blog demo',
  head: [
    // ['link', { rel: 'icon', href: '/vue-logo.png' }]
  ],
  themeConfig: {
  	// 你的GitHub仓库
    repo: 'https://github.com/duyu123/serina.git',
    // 自定义仓库链接文字。
    repoLabel: 'My GitHub',
  	nav: [
  		{ text: 'Home', link: '/' },
  		{ text: 'page-a', link: '/blog/page-a.md' }
  	],
  	sidebar: [
      ['/', '首页'],
      ['/blog/page-a.md', '我的第一篇博客']
    ]
  }
}