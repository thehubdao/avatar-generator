import React, {Component} from "react";
import {WithRouterProps} from "next/dist/client/with-router";
import {withRouter} from "next/router";

import AGButton from "../../../components/ag-button.component";
import { IsNotLogIn} from "../../../utils/firebase.util";
import {PageLocation} from "../../../enums/common.enum";
import {delay} from "../../../utils/exporter.util";

import AvatarGenerator, { 
  getServerSideProps as serverProps,
  AvatarGeneratorProps
} from "../../index"

interface BulkExportProps extends WithRouterProps, AvatarGeneratorProps {
  campaigns: string[];
}

// boundary a value name
const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);


/**
 * HOC to intercept Avatar preview exporter from Admin view
 * To access the Avatar Module, you can use the member variable `this.ref`
 * and use its methods and variables
 * 
 * @param AvatarComp 
 * @returns
 */
function withAdminExporter(AvatarComp: typeof AvatarGenerator) {
  return withRouter(class extends Component<BulkExportProps>  {
    // identify all parts base on feature types
    parts: Map<string, any[]> = new Map()
    // features are the mesh section where a part can be attached
    features: { type: string, offset: number, id: string }[] = []
    // keep each combinatio unique
    combinationHistory: Set<string> = new Set()
    // current combination
    combination: number[] = []
    // Avatar component reference
    private ref: React.RefObject<AvatarGenerator>

    constructor(props: BulkExportProps) {
      super(props);
      this.state = {
        selectedCampaign: null,
      };
      this.ref = React.createRef()
    }
  
    async componentDidMount() {
      const avatarGenerator = this.ref.current as AvatarGenerator 
      if(await IsNotLogIn())
        await this.props.router.push(PageLocation.Admin);

      // set the avatar generator page in export/viewport mode by default
      avatarGenerator.changeView()
      console.log("avatar generator data: ", avatarGenerator)
    }
    
    /**
     * 
     * @returns 
     */
    renderCampaignOptions() {
      return this.props.campaigns.map((option) =>
        <option value={option} key={option}>{option}</option>
      );
    }
    
    /**
     * 
     * @param event 
     */
    onSelectCampaign = (event: any) => {
      this.setState({
        selectedCampaign: event.target.value
      })
    }

    /**
     * trigger to export all combination meshes
     */
    async onExportAll() {
      const avatarGenerator = this.ref.current

  
      //this.ref.current?.exportModel()
      await this.permutationParts()
    }
    
    /**
     * 
     */
    async permutationParts() {
      const partIndexes = this.combination;
      const partLengthByFeature = this.features.map(
        ({type}) => this.parts.get(type)?.length
      );
      const iterationLimit = this.getIterationNumbers();
      let iteration = 0;

      console.log("starting: ", partIndexes)
      console.log("limits: ", partLengthByFeature)

      while(iteration < iterationLimit) {
        //await delay(2000);

        const comb = await this.getCombinationByIteration(iteration)
        console.log(`itr ${iteration}: `, comb);

        iteration++;
      }
      
      
      console.log('Finished combinations');
    }

    getCombinationByIteration(itr: number) {
      let remain = itr
      const partIndexes = this.combination;
      const partLengthByFeature = this.features.map(
        ({type}) => this.parts.get(type)?.length
      );

      const combinationIndex = partIndexes.map((part, index) => {
        const nextIndexFeature = clamp(index + 1, 1, partLengthByFeature.length - 1)
        const limit = partLengthByFeature[index] || 0
        const offset = partLengthByFeature.slice(nextIndexFeature)
        const cycle = offset.reduce((acc: number, amount) => {
          acc += amount as number
          return acc
        }, 0);
        let value = 0
        
        if(remain > 0) {
          value = clamp(Math.floor(itr / cycle), 0, limit)
          remain -= cycle * limit 
        }

        
        return value
      });

      return combinationIndex
    }

    /**
     * 
     * @param partIndexes 
     */
    async setCombinationByIndexes(partIndexes: number[]) {
      const avatarGenerator = this.ref.current
      const changePartAsync = []
      for(let itr = 0; itr < this.features.length; itr++) {
        const feature = this.features[itr]
        const partIndex = partIndexes[itr]
        const partsByType = this.parts.get(feature.type) || []
        const part = partsByType[partIndex]

        const promise = avatarGenerator?.changePart(
          part.id,
          part.path,
          part.name,
          part.type
        )
        changePartAsync.push(promise)
      }

      await Promise.all(changePartAsync)
      console.log('combination done')
    }

    /**
     * Set the first mesh combination based on index values for each part
     * mesh combination 0-0-0-0 where each digit is a feature
     * and the value of the feature represents the index for the feature part
     */
    setInitialCombination() {
      const partIndexes = new Array(this.features.length).fill(0)
      this.combination = partIndexes
      this.setCombinationByIndexes(partIndexes)
    }

    /**
     * 
     */
    parseAvatarData() {
      const avatarGenerator = this.ref.current;
      this.features = Object.entries(avatarGenerator?.partListData || {})
        .map(([type]) => ({
          type,
          id: type,
          offset: 0,
        }))
        .sort((partA, partB) => partA.id > partB.id ? 1 : -1);
      
      this.features.forEach((feature) => {
        const { type } = feature
        const partList = avatarGenerator?.partList || []
        const partsByType = partList
          .filter((part) =>
            part.type === type
          )
          .sort((partA, partB) => partA.index > partB.index ? 1 : -1)
        this.parts.set(type, partsByType)
      });

      console.log('feature keys', avatarGenerator?.partListData, this.features, this.parts)
      this.setInitialCombination();
    }

    getIterationNumbers() {
      let recursionNumber = 1

      this.parts.forEach((partsByType) =>
        recursionNumber *= partsByType.length
      )

      console.log('Amount of possible combinations: ', recursionNumber)
      return recursionNumber;
    }

    render() {
      return (
        <>
          <div className="fixed" style={{width: "50%", zIndex: 9999}}>
            <AGButton type="secondary" onClickEvent={() => this.onExportAll()}>
                Export All
            </AGButton>
          </div>
          <AvatarComp
            ref={this.ref}
            onDataLoaded={() => this.parseAvatarData()}
            {...this.props}
          />
        </>
      )
    }
    
  })
}

export default withAdminExporter(AvatarGenerator)
export const getServerSideProps = serverProps
