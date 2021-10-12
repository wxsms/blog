---

title: WordPress 文章归档页面实现
date: 2016-02-02T16:06:16+00:00
categories:
  - CMS
tags:
  - MySQL
  - PHP
  - Wordpress

---



归档页就是一个包含站点所有已发布文章的列表页面，通常默认会根据发布时间来进行排序，然后可能会有一些分页排序页内搜索等功能。实现这个功能可以用Wordpress插件，当然也可以自己写代码，我一开始就是用了一款插件，觉得实现了功能还不错就没管它。后来想要做一些自定义的修改，比如插件是按月份分组然而我想改成年份，就稍微看了看它的代码。一看不得了，莫名地有一种总算见识到了什么叫又烂又臭的代码的感觉涌上心头，做了这么多年伸手党总算是被恶心到了，简直不能忍，于是琢磨着自己写一个简单的模板页，不用它了。

<!-- more -->

## 吐槽区

首先来说说为什么这个插件的代码**又烂又臭**，在后面我再对它进行针对性的改进。哦对了它的名字叫**Clean Archives Reloaded**，作者叫**Viper007Bond**，来自美国俄勒冈州，没错就是点名批评，看来鬼佬的编码水平也不是普遍的高啊，这坨屎简直是开源界的耻辱。去到各搜索引擎搜索“Wordpress归档”关键字还有很多文章推荐使用该插件，看来大家都不太关心代码质量，只要能用就行。 该插件的主要设计思路如下：

  1. 从WP数据库中抓取文章
  2. 根据用户配置分组并排序
  3. 组织并输出HTML到页面相关位置

OK，就这么三步，实际上我们也只需要这么点东西。暂且不讨论步骤是否可以简化，我们先来看看它有着怎样的内心世界。

```php
// A direct query is used instead of get_posts() for memory reasons
$rawposts = $wpdb->get_results( "SELECT ID, post_date, post_date_gmt, comment_status, comment_count FROM $wpdb->posts WHERE post_status = 'publish' AND post_type = 'post' AND post_password = ''" );
```

这个是它的唯一一条SQL语句，可以看到作者为了给我们节省内存真是殚精竭力，本着够用就行的精神，放弃使用Wordpress自带的API，直接使用查询语句从数据库中查询出来了非常有限的一些字段。值得称赞。 按照插件的思路，紧接着就是分组啦：

```php
// Loop through each post and sort it into a structured array
foreach( $rawposts as $post ) {
	$posts[ mysql2date( 'Y.m', $post->post_date ) ][] = $post;
}
$rawposts = null; // More memory cleanup
```

排序啦：

```php
( 'new' == $atts['monthorder'] ) ? krsort( $posts ) : ksort( $posts );

// Sort the posts within each month based on $atts
foreach( $posts as $key => $month ) {
    $sorter = array();
    foreach ( $month as $post )
        $sorter[] = $post->post_date_gmt;

    $sortorder = ( 'new' == $atts['postorder'] ) ? SORT_DESC : SORT_ASC;

    array_multisort( $sorter, $sortorder, $month );

    $posts[$key] = $month;
    unset($month);
}
```

分组的思路就是根据一篇文章的年以及月来将原本的一维数组重新组织到一个新的二维数组中去，以方便后面的循环。排序有点复杂，首先大局上它是能够根据配置按月份从新到旧或者反方向的排序，然后在每个月份里面也能够根据配置从新到旧或者反方向的排序，这个设定简直蛋疼，谁这么无聊正着排一遍在里面反着又排一遍，即折磨自己又折磨读者，不过存在即合理，这里也不说它。**我想吐槽的是，既然你都把SQL写出来了，你也知道至少要排一次序了，又何必费尽周章在查出来以后排呢，我们直接在SQL里面排不比这一大串代码优雅吗？不快速吗？不节省内存吗？此外，这个分组也是萌萌哒，我们就不能在SQL里面先把组给分好吗，非要写个循环来调用 **`mysql2date`，这样真的好吗？当然如果作者没有学过 `ORDER BY`，也不知道SQL都有各自的内置日期函数，这些也就算了。我们接着往下看。 接下来的步骤是组织HTML：

```php
// Generate the HTML
$html = '<div class="car-container';
if ( 1 == $atts['usejs'] ) $html .= ' car-collapse';
$html .= '">'. "\n";

// 此处省略n行

$html .= "</ul>\n</div>\n";
return $html;
```

看到这里我已经瞎了。。。尤其是高亮的那一行。。。省略的N行中充斥着的都是如此的代码。它还不止有 `. "\n"` 之流，在省略的内容中甚至连HTML的编码器缩进作者都保留得很好很好。WTF？？这TM都是些什么鬼？？作者的这些杠N和缩进是写给鬼看的吗？？？字符串拼凑各种内容这种事我自己不懂事的时候也干过不少也就不说了，但这作者这一种原汁原味的拼法真是我有屎以来见过的最特立独行的行为艺术。

让我们接着来看生成HTML之中的一部分核心代码。显然其中会有一些循环用来生成列表，并且在每个内层循环之前应该输出一个标题之类的东西用来指示以下的内容属于哪一年哪一个月。代码如下：

```php
$firstmonth = TRUE;
foreach( $posts as $yearmonth => $posts ) {
    list( $year, $month ) = explode( '.', $yearmonth );

    $firstpost = TRUE;
    foreach( $posts as $post ) {
        if ( TRUE == $firstpost ) {
            $html .= '	<li><span class="car-yearmonth">' . sprintf( __('%1$s %2$d'), $wp_locale->get_month($month), $year );
            if ( '0' != $atts['postcount'] ) $html .= ' <span title="' . __('Post Count', 'clean-archives-reloaded') . '">(' . count($posts) . ')</span>';
            $html .= "</span>\n		<ul class='car-monthlisting'>\n";
            $firstpost = FALSE;
        }

        $html .= '			<li>' .  mysql2date( 'd', $post->post_date ) . ': <a href="' . get_permalink( $post->ID ) . '">' . get_the_title( $post->ID ) . '</a>';

        // Unless comments are closed and there are no comments, show the comment count
        if ( '0' != $atts['commentcount'] && ( 0 != $post->comment_count || 'closed' != $post->comment_status ) )
            $html .= ' <span title="' . __('Comment Count', 'clean-archives-reloaded') . '">(' . $post->comment_count . ')</span>';

        $html .= "</li>\n";
    }

    $html .= "		</ul>\n	</li>\n";
}
```

第5-12行代码，第一眼看到的时候马上就能闻到一股弱者的气息。**作者想要在循环开始之前先输出一个列表标题，所以想到了一个使用标志位的办法，但是我们明明可以直接在循环前面做这件事的，根本不需要这个萌萌哒标志位。**

还有第14行。作者明明一直在标榜自己是如何节省时间节省内存的，结果在这里却使用了内置函数 `get_the_title` 以及 `get_permalink`，后者很正常，因为 wordpress 的文章链接是可以改变的，不能直接写死，必须查，那前者这个函数是做什么的呢？很明显，根据一篇文章的 ID 来获取它的标题。要如何根据 ID 来获取标题呢，我们能用算法算出来吗？显然不能，这里面显然需要一次数据库查询，至少也是一次缓存查询，而且它这个函数写在循环里面，我的天，这里面是多少条 SQL，你直接在一开始把 Title 也给查出来不就万事大吉了吗。。。

插件的核心功能大概就到此为止，为了实现让用户可以点击收起与展开每个内层列表的功能，作者还添加了一些 JavaScript 代码，就不吐槽了吧，我已经好累了。

## 改进

赶紧把这插件删了，删个干净，然后我们来改代码。因为我并不需要配置什么什么的，也不需要什么JS，怎么个分组怎么个排序的需求很明确，所以直接 HARD CODE。原插件还有一个缓存查询出来的数据的功能，由于我已经用了更强大的缓存，直接将动态页面缓存成纯 HTML，所以也不需要。以上内容通通砍掉，核心代码就很简单了。 首先是 SQL 查询：

```php
global $wpdb;
$rawposts = $wpdb->get_results("SELECT ID, year(post_date) as post_year, post_date, post_date_gmt, post_title FROM $wpdb->posts WHERE post_status = 'publish' AND post_type = 'post' AND post_password = '' order by post_date_gmt desc");
```

这里按照发布时间降序排序，为什么要用GMT时间而不直接用本地时间呢，我猜可能是为了防止我在这边发了一篇文章然后马上飞到美国又发一篇，可能会乱套吧，反正这么写更严谨，虽然不太可能发生。然后除了多选择一个post_title字段以外，还使用MySQL的一个内置函数选择了这篇文章发布时的年度，这样就不用在分组的时候使用N多遍 `mysql2date` 函数了。节省了大量步骤。 然后是分组：

```php
foreach ($rawposts as $post) {
    $posts[$post->post_year][] = $post;
}
$rawposts = null;
```

然后是HTML部分：

```php
$html = '<div class="archives-container"><ul class="archives-list">';
foreach ($posts as $year => $posts_yearly) {
    $html .= '<li><div class="archives-year">' . $year . '年</div><ul class="archives-sublist">';
    foreach ($posts_yearly as $post) {
        $html .= '<li>';
        $html .= '<time datetime="' . $post->post_date . '">' . mysql2date('m月d日 D', $post->post_date, true) . '</time>';
        $html .= '<a href="' . get_permalink($post->ID) . '">' . $post->post_title . '</a>';
        $html .= "</li>";
    }
    $html .= "</ul></li>";
}
$html .= "</ul></div>";
return $html;
```

两个字：简洁。

## 使用方法

我们复制一份主题目录下的 `page.php` 文件，然后重命名为 `template-archives.php`，主要是给它加上以上的代码并且调用之。 对于我正在使用的主题来说，文件内容如下：

```php
<?php
/*
Template Name: archives
*/


function _PostList($atts = array())
{
    global $wpdb;
    $rawposts = $wpdb->get_results("SELECT ID, year(post_date) as post_year, post_date, post_title FROM $wpdb->posts WHERE post_status = 'publish' AND post_type = 'post' AND post_password = '' order by post_date desc");
    foreach ($rawposts as $post) {
        $posts[$post->post_year][] = $post;
    }
    $rawposts = null;
    $html = '<div class="archives-container"><ul class="archives-list">';
    foreach ($posts as $year => $posts_yearly) {
        $html .= '<li><div class="archives-year">' . $year . '年</div><ul class="archives-sublist">';
        foreach ($posts_yearly as $post) {
            $html .= '<li>';
            $html .= '<time datetime="' . $post->post_date . '">' . mysql2date('m月d日 D', $post->post_date, true) . '</time>';
            $html .= '<a href="' . get_permalink($post->ID) . '">' . $post->post_title . '</a>';
            $html .= "</li>";
        }
        $html .= "</ul></li>";
    }
    $html .= "</ul></div>";
    return $html;
}

function _PostCount()
{
    $num_posts = wp_count_posts('post');
    return number_format_i18n($num_posts->publish);
}

get_header(); ?>

    <div id="primary" class="content-area">
        <main id="main" class="site-main" role="main">

            <article <?php post_class(); ?>>
                <header class="entry-header">
                    <h1 class="entry-title"><?php the_title(); ?></h1>
                </header>
                <!-- .entry-header -->

                <div class="entry-content">
                    <?php
                    echo _PostList();
                    ?>
                </div>
                <!-- .entry-content -->
            </article>
            <!-- #post-## -->


        </main>
        <!-- #main -->
    </div>
    <!-- #primary -->

<?php get_sidebar(); ?>
<?php get_footer(); ?>
```

然后我们把它上传到主机的主题目录下，来到wordpress管理控制台新建一个page，模板选择 `archives`，什么也不用输入（可以加个标题），保存，就可以看到效果了。当然这里没有涉及到CSS样式，可以在主题的 `style.css` 中自定义，也可以直接写在 `template-archives.php` 内，爱写哪写哪。本站使用的CSS如下所示：

```css
.archives-year {
    color: #777;
    border-bottom: 1px solid #e8e8e8;
    margin: 40px 0 10px 0;
    padding-bottom: 7px;
}

.archives-list {
    list-style: none;
    margin: 20px 0!important;
}

.archives-sublist {
    list-style: none;
    font-size: 90%;
    margin-left: 0 !important;
}

.archives-sublist li time {
    color: #777;
    width: 140px;
    min-width: 140px;
    max-width: 140px;
    display: table-cell;
    vertical-align: top;
}

.archives-sublist li a {
    display: table-cell;
    vertical-align: top;
}
```

[点此查看实际效果](http://anubarak.com/archives/) （可能因为网站更新而不符合）
