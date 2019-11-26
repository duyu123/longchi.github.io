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
  		{ text: 'Home', link: '/blog/javascript/' },
      { text: '博客', 
        items: [
          {
            text: 'JavaScript',
            link: '/blog/javascript/'
          },
          {
            text: 'TypeScript',
            link: '/blog/typescript/'
          }
        ]
      }
  	],
  	sidebar: {
      '/blog/javascript/': [
        {
          title: 'JavaScript',
          collapsable: false,
          children: [
            ['javascript1.md', 'D3圆饼图'],
          ]
        },
        {
          title: 'Vue',
          collapsable: false,
          children: [
            ['vue-nextTick.md', 'nextTick事件原理'],
          ]
        }
      ],
      '/blog/typescript/': [
        {
          title: 'TypeScript',
          collapsable: false,
          children: [
            ['typescript1.md', '基本类型']
          ]
        }
      ],
      sidebarDepth: 2,
      // ['/', '首页'],
      // ['/blog/page-a.md', '我的第一篇博客']
    }
  }
}