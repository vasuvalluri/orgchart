import React from "react";
import { withRouter } from "react-router-dom";
import { Form, Input, Modal, Button } from "antd";
import { config } from "../Config";
const axios = require("axios");
const BASE_URL = config.BASE_URL;
const SAVE_FEEDBACK = "/saveFeedback";

let user;
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const validateMessages = {
  required: "${label} is required!",
};

class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isPrintable: false,
      visible: false,
    };
  }
  onFinish = (values) => {
    this.setState({ visible: true });
    axios
      .post(`${BASE_URL}${SAVE_FEEDBACK}`, {
        emailAddress: user.email,
        feedbackText: values.feedback.feedback_text,
      })
      .then((res) => {
        // console.log(`statusCode: ${res.status}`);
        //console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  handleCancel = () => {
    this.setState({ visible: false });
    this.props.history.push("/orgchart");
  };

  render() {
    user = this.props.user;
    return (
      <>
        <h3>We would love to hear from you!!</h3>
        <Form
          {...layout}
          name="nest-messages"
          onFinish={this.onFinish}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          validateMessages={validateMessages}
        >
          <Form.Item
            name={["feedback", "feedback_text"]}
            label="Feedback:"
            rules={[
              {
                required: true,
                message: "Please enter feedback before submitting.",
              },
            ]}
          >
            <Input.TextArea style={{ height: 300 }} />
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <Modal
          visible={this.state.visible}
          title="Title"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Return
            </Button>,
          ]}
        >
          <p>
            Thank you for submitting your feedback. We will get back to you with
            updates.
          </p>
        </Modal>
      </>
    );
  }
}
export default withRouter(Feedback);
