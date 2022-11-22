import React from "react";
import { Select } from "antd";
const { Option } = Select;
class NameSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
  }

  render() {
    if (this.props.names) {
      return (
        <Select
          style={{ width: 300 }}
          //  options={this.props.names}
          allowClear="true"
          placeholder="Search in Org Chart"
          optionFilterProp="children"
          autoClearSearchValue={true}
          onChange={this.props.onNameChange()}
          showArrow={true}
          showSearch={true}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {this.props.names.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>
      );
    } else {
      return <></>;
    }
  }
}

export default NameSearch;
