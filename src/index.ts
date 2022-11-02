import { Context, segment } from 'koishi'
import Schema from 'schemastery'

export const name = 'v2ex'

export interface Config {
  authToken: string;
}

export const Config = Schema.object({
  authToken: Schema.string().default('').required().description('请填写你的v2ex auth token'),
})

const apiEndpointPrefix = 'https://www.v2ex.com/api/v2/topics/';

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  async function fetchDataFromAPI(id: string) {
    const headers: object = {
      Authorization: config.authToken
    };
    return await ctx.http.get(apiEndpointPrefix + id, {headers});
  };

  ctx.middleware(async (session, next) => {
    if (!session.content.includes('v2ex.com')) return next()
    const regExp = /.*\/t\/([0-9]*)/;
    const id = session.content.match(regExp)[1];

    try {
      const result = await fetchDataFromAPI(id);
      if (result.success !== true) {
        return '解析失败!';
      }
      const title = result.result.title;
      const content = result.result.content || '';
      const nodeTitle = result.result.node.title;

      return `====v2ex解析====\n节点: ${nodeTitle}\n${title}\n${content}`;

    } catch(err) {
      console.log(err);
      return `发生错误!;  ${err}`;
    }
  });
}
