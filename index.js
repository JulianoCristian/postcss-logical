// tooling
import postcss from 'postcss';

// internal tooling
import transformBorder from './lib/transform-border';
import transformFloat from './lib/transform-float';
import transformInset from './lib/transform-inset';
import transformResize from './lib/transform-resize';
import transformSide from './lib/transform-side';
import transformSize from './lib/transform-size';
import transformSpacing from './lib/transform-spacing';
import transformTextAlign from './lib/transform-text-align';
import transformTransition from './lib/transform-transition';
import matchSupportedProperties from './lib/match-supported-properties';
import { splitBySlash, splitBySpace } from './lib/split';

// supported transforms
const transforms = {
	'border': transformBorder['border'], 'border-width': transformBorder['border'], 'border-style': transformBorder['border'], 'border-color': transformBorder['border'],
	'border-block': transformBorder['border-block'], 'border-block-width': transformBorder['border-block'], 'border-block-style': transformBorder['border-block'], 'border-block-color': transformBorder['border-block'],
	'border-block-start': transformBorder['border-block-start'], 'border-block-start-width': transformBorder['border-block-start'], 'border-block-start-style': transformBorder['border-block-start'], 'border-block-start-color': transformBorder['border-block-start'],
	'border-block-end': transformBorder['border-block-end'], 'border-block-end-width': transformBorder['border-block-end'], 'border-block-end-style': transformBorder['border-block-end'], 'border-block-end-color': transformBorder['border-block-end'],
	'border-inline': transformBorder['border-inline'], 'border-inline-width': transformBorder['border-inline'], 'border-inline-style': transformBorder['border-inline'], 'border-inline-color': transformBorder['border-inline'],
	'border-inline-start': transformBorder['border-inline-start'], 'border-inline-start-width': transformBorder['border-inline-start'], 'border-inline-start-style': transformBorder['border-inline-start'], 'border-inline-start-color': transformBorder['border-inline-start'],
	'border-inline-end': transformBorder['border-inline-end'], 'border-inline-end-width': transformBorder['border-inline-end'], 'border-inline-end-style': transformBorder['border-inline-end'], 'border-inline-end-color': transformBorder['border-inline-end'],
	'border-start': transformBorder['border-start'], 'border-start-width': transformBorder['border-start'], 'border-start-style': transformBorder['border-start'], 'border-start-color': transformBorder['border-start'],
	'border-end': transformBorder['border-end'], 'border-end-width': transformBorder['border-end'], 'border-end-style': transformBorder['border-end'], 'border-end-color': transformBorder['border-end'],
	'border-start-start-radius': transformBorder['border-start-start-radius'], 'border-start-end-radius': transformBorder['border-start-end-radius'], 'border-end-start-radius': transformBorder['border-end-start-radius'], 'border-end-end-radius': transformBorder['border-end-end-radius'],
	'clear': transformFloat,
	'inset': transformInset,
	'margin': transformSpacing,
	'padding': transformSpacing,
	'block': transformSide['block'],
	'block-start': transformSide['block-start'],
	'block-end': transformSide['block-end'],
	'inline': transformSide['inline'],
	'inline-start': transformSide['inline-start'],
	'inline-end': transformSide['inline-end'],
	'start': transformSide['start'],
	'end': transformSide['end'],
	'float': transformFloat,
	'resize': transformResize,
	'size': transformSize,
	'text-align': transformTextAlign,
	'transition': transformTransition,
	'transition-property': transformTransition
};

// properties that will be split by slash
const splitBySlashPropRegExp = /^border(-block|-inline|-start|-end)?(-width|-style|-color)?$/i;

// plugin
export default postcss.plugin('postcss-logical-properties', opts => {
	const preserve = Boolean(Object(opts).preserve);
	const dir = !preserve && typeof Object(opts).dir === 'string'
		? /^rtl$/i.test(opts.dir)
			? 'rtl'
		: 'ltr'
	: false;

	return root => {
		root.walkDecls(decl => {
			const parent = decl.parent;
			const values = splitBySlashPropRegExp.test(decl.prop) ? splitBySlash(decl.value, true) : splitBySpace(decl.value, true);
			const prop = decl.prop.replace(matchSupportedProperties, '$2$5').toLowerCase();

			if (prop in transforms) {
				const replacer = transforms[prop](decl, values, dir);

				if (replacer) {
					[].concat(replacer).forEach(replacement => {
						if (replacement.type === 'rule') {
							parent.before(replacement);
						} else {
							decl.before(replacement);
						}
					});

					if (!preserve) {
						decl.remove();

						if (!parent.nodes.length) {
							parent.remove();
						}
					}
				}
			}
		});
	};
});
