import { getSingleMemberAsRaw } from '../../../../member'

const createSMTPFailedContent = (mailer: string, conf: { from: string; number: number; msg: string }) => {
  const person = getSingleMemberAsRaw(conf.number)
  let grate = 'Hello, '
  if (person.status === 'ok') {
    grate += person.details?.name
  } else {
    grate += String(conf.number) + '同学'
  }
  grate += '，您的来稿因格式未被收录，请检查格式'

  const explain = `首先，实在抱歉给您带来麻烦！<br />
由于我们使用的自动同步（邮件投稿自动合并到平台），故计算机需要正确的格式才可以正确处理。<br />
<p style="color: red">您的报错信息：${conf.msg}</p>
<hr />
格式说明：<br />
1. 投稿必须是<b>.docx</b>文件格式，不能是<i>Word 97-2003</i>，不然核对时会出现问题。<br />
2. 投稿的标题（主题）必须是"<u><b>来稿</b></u>"二字<br />
3. 投稿正文格式（除了这些<b>不能</b>添加其他的，必须是<b>英文冒号</b>，在冒号后<b>填写信息</b>，大括号和单引号都要（<i>JSON5格式</i>））：<br />
<br />
{<br />
&nbsp;&nbsp;学号: <i>您的校徽号</i><br />
&nbsp;&nbsp;标题: '<i>您文章的标题</i>'<br />
&nbsp;&nbsp;介绍: '<i>您对于本文章的介绍</i>'<br />
&nbsp;&nbsp;体裁: '<i>您本文章的体裁</i>'<br />
}<br />
<br />
<blockquote><i>您也可以复制该格式进行标准化正文投稿。
我们会每1小时检测一次是否会有新的来稿。</i></blockquote>`
  const options = {
    from: `"Study Department" <${mailer}>`,
    to: conf.from,
    subject: grate,
    text: explain,
    html: explain,
  }
  return options
  // SMTPTransport
}

export { createSMTPFailedContent }
