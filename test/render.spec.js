const expect = require('expect');
const fs = require('fs');
const render = require('../lib/render');

const markdown = fs.readFileSync('demo/a.md').toString();

describe('render', () => {

  it('should render basic template', () => {
    const actual = render.render('', {});
    expect(actual).toInclude('<title>reveal-md</title>');
    expect(actual).toInclude('<link rel="stylesheet" href="/css/theme/black.css"');
    expect(actual).toInclude('<link rel="stylesheet" href="/css/highlight/zenburn.css"');
    expect(actual).toInclude('<link rel="stylesheet" href="/css/print/paper.css" type="text/css" media="print">');
    expect(actual).toInclude('<div class="slides"><section  data-markdown><script type="text/template"></script></section></div>');
    expect(actual).toInclude('<script src="/js/reveal.js"></script>');
    expect(actual).toInclude('{ src: \'/plugin/markdown/markdown.js\'');
    expect(actual).toInclude('var options = {};');
  });

  it('should render markdown content', () => {
    const actual = render.render('# header', {});
    expect(actual).toInclude('<div class="slides"><section  data-markdown><script type="text/template"># header</script></section></div>');
  });

  it('should render custom scripts', () => {
    const actual = render.render('# header', {scripts: 'custom.js,also.js'});
    expect(actual).toInclude('<script src="/scripts/custom.js"></script>');
    expect(actual).toInclude('<script src="/scripts/also.js"></script>');
  });

  it('should render print stylesheet', () => {
    const actual = render.render('', {print: true});
    expect(actual).toInclude('<link rel="stylesheet" href="/css/print/pdf.css" type="text/css" media="print">');
  });
});

describe('parseSlides', () => {

  it('should render slides split by horizontal separator', () => {
    const actual = render.parseSlides('Slide A\n\n---\n\nSlide B', {});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section  data-markdown><script type="text/template">\nSlide B</script></section>');
  });

  it('should render sub slides split by vertical separator', () => {
    const actual = render.parseSlides('Slide A\n\n---\n\nSlide B\n\n----\n\nSlide C', {});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section >' +
        '<section data-markdown><script type="text/template">\nSlide B\n</script></section>' +
        '<section data-markdown><script type="text/template">\nSlide C</script></section>' +
      '</section>');
  });

  it('should render slides split by custom separators', () => {
    const actual = render.parseSlides('Slide A\n\n\nSlide B\n\nSlide C', {separator: '\n\n\n', verticalSeparator: '\n\n'});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template">Slide A</script></section>' +
      '<section >' +
        '<section data-markdown><script type="text/template">Slide B</script></section>' +
        '<section data-markdown><script type="text/template">Slide C</script></section>' +
      '</section>');
  });

  it('should render speaker notes', () => {
    const actual = render.parseSlides('Slide A\n\nNote: test', {});
    expect(actual.slides).toEqual('<section  data-markdown><script type="text/template">Slide A\n\n<aside class="notes"><p>test</p>\n</aside></script></section>');
  });

  it('should parse YAML front matter', () => {
    const actual = render.parseSlides('---\nseparator: <!--s-->\n---\nSlide A<!--s-->Slide B', {});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template">\nSlide A</script></section>' +
      '<section  data-markdown><script type="text/template">Slide B</script></section>');
  });

  it('should ignore comments (e.g. custom slide attributes)', () => {
    const actual = render.parseSlides('Slide A\n\n---\n\n<!-- .slide: data-background="./image1.png" -->\nSlide B', {});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section  data-markdown><script type="text/template">\n<!-- .slide: data-background="./image1.png" -->\nSlide B</script></section>');
  });

  it('should use preprocesser for markdown', () => {
    const actual = render.parseSlides('# Slide A\n\ncontent\n\n# Slide B\n\ncontent', {preprocessor: 'test/preproc'});
    expect(actual.slides).toEqual('' +
      '<section  data-markdown><script type="text/template"># Slide A\n\ncontent\n\n</script></section>' +
      '<section  data-markdown><script type="text/template">\n# Slide B\n\ncontent</script></section>');
  });

});