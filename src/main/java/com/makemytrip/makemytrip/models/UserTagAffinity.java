package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_tag_affinity")
@CompoundIndex(name = "user_tag_idx", def = "{'userId': 1, 'tag': 1}", unique = true)
public class UserTagAffinity {

    @Id
    private String _id;

    private String userId;
    private String tag;
    private double score;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
}