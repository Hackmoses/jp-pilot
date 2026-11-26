import type { DrawingProps } from '../lesson'
import { Diagram, Flow, timeline, type Point } from './Diagram'

const stages = [
  ['outline', 'ra', 'la', 'rv', 'lv'],
  ['blue', 'svc', 'ivc', 'ra'],
  ['tri', 'rv', 'pv', 'pa', 'lungs'],
  ['red', 'veins', 'la', 'mit', 'lv', 'av', 'aorta', 'body'],
  ['wall'],
]

const targets: Record<string, Point> = {
  outline: [180, 74], blue: [28, 114], svc: [32, 64], ivc: [25, 193], ra: [141, 115], tri: [142, 131], rv: [139, 172],
  pv: [108, 164], pa: [75, 56], lungs: [176, 39], red: [291, 45], veins: [285, 102], la: [224, 114],
  mit: [229, 139], lv: [223, 180], av: [256, 169], aorta: [346, 175], body: [211, 228], wall: [231, 204],
}

export default function Heart(props: DrawingProps) {
  const { active, shown, chapter, reduced } = timeline(props, stages)
  const flow = (d: string, tone: string, scene: number, part: string) =>
    <Flow d={d} tone={tone} seconds={props.frame.seconds} moving={!reduced && chapter === scene && active === part} />

  return <Diagram label="Four heart chambers and valves, with the routes to the lungs and body" point={!reduced && active ? targets[active] : undefined}>
    <path class="jp-biology-anatomy" d="M181 84C156 52 99 59 96 105C93 148 121 180 180 216C204 232 259 209 264 151C280 77 229 48 181 84Z" />
    {shown('ra') && <path class="jp-biology-blue-soft" d="M175 94C153 64 109 73 109 103Q108 122 122 126H175Z" />}
    {shown('la') && <path class="jp-biology-red-soft" d="M189 94C214 65 254 75 254 104Q252 119 244 126H189Z" />}
    {shown('rv') && <path class="jp-biology-blue-soft" d="M118 134H175L182 200Q133 175 118 134Z" />}
    {shown('lv') && <path class="jp-biology-red-soft" d="M190 135H247Q243 200 207 204Q189 197 190 135Z" />}
    {shown('wall') && <path class="jp-biology-wall" d="M252 144Q251 200 213 213Q200 218 188 206" />}
    {shown('ra') && <text x="135" y="103" text-anchor="middle">Right atrium</text>}
    {shown('la') && <text x="227" y="103" text-anchor="middle">Left atrium</text>}
    {shown('rv') && <text x="145" y="151" text-anchor="middle"><tspan x="145">Right</tspan><tspan x="145" dy="14">ventricle</tspan></text>}
    {shown('lv') && <text x="222" y="153" text-anchor="middle"><tspan x="222">Left</tspan><tspan x="222" dy="14">ventricle</tspan></text>}

    {shown('svc') && <>
      {flow('M17 55H48V92Q49 108 120 108', 'jp-biology-blue', 1, 'svc')}
      <text x="9" y="19">Superior<tspan x="9" dy="14">vena cava</tspan></text>
    </>}
    {shown('ivc') && <>
      {flow('M141 228H25V122H119', 'jp-biology-blue', 1, 'ivc')}
      <text x="6" y="152">Inferior<tspan x="6" dy="14">vena cava</tspan></text>
    </>}
    {shown('tri') && <>
      {flow('M142 110V141', 'jp-biology-blue', 2, 'tri')}
      <path class="jp-biology-leader" d="M91 128H129l13 6 13-6" />
      <text x="7" y="131">Tricuspid valve</text>
    </>}
    {shown('pa') && flow('M141 173Q78 178 78 145V39H156', 'jp-biology-blue', 2, 'pa')}
    {shown('pv') && <>
      <path class="jp-biology-leader" d="M109 163l-4 9 6 7M108 173L96 193H61" />
      <text x="12" y="208">Pulmonary valve</text>
    </>}
    {shown('pa') && <text x="89" y="53">Pulmonary<tspan x="89" dy="14">artery</tspan></text>}
    {shown('lungs') && <g>
      <path class="jp-biology-anatomy" d="M187 28Q176 15 164 33Q149 55 164 57Q177 56 187 48ZM193 28Q204 15 216 33Q231 55 216 57Q203 56 193 48Z" />
      <text x="190" y="16" text-anchor="middle">Lungs</text>
    </g>}
    {shown('veins') && <>
      {flow('M221 36H285V113H245', 'jp-biology-red', 3, 'veins')}
      <text x="294" y="57">Pulmonary<tspan x="294" dy="14">veins</tspan></text>
    </>}
    {shown('mit') && <>
      {flow('M223 110V141', 'jp-biology-red', 3, 'mit')}
      <path class="jp-biology-leader" d="M211 129l12 6 13-6h37" />
      <text x="277" y="132">Mitral valve</text>
    </>}
    {shown('aorta') && <>
      {flow('M221 177Q260 177 272 158H346V228H239', 'jp-biology-red', 3, 'aorta')}
      <text x="324" y="150">Aorta</text>
    </>}
    {shown('av') && <>
      <path class="jp-biology-leader" d="M251 166l9 7-2 8 13 12h25" />
      <text x="276" y="208">Aortic valve</text>
    </>}
    {shown('body') && <g>
      <path class="jp-biology-leader" d="M145 226Q167 216 190 226T235 226M145 231Q166 240 190 231T235 231" />
      <text x="190" y="246" text-anchor="middle">Body capillaries</text>
    </g>}
  </Diagram>
}
